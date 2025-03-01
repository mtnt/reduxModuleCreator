import { Action, Action as ReduxAction, AnyAction as ExtendedReduxAction, Reducer as RegularReducer } from 'redux';
import { nanoid } from 'nanoid/non-secure';

import { createModule, RMCCtl } from '../ModuleCreator';

type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
  ? '0' extends keyof T
    ? undefined
    : number extends keyof T
    ? T[number]
    : undefined
  : undefined;

type FieldWithPossiblyUndefined<T, Key> = FieldType<Exclude<T, undefined>, Key> | Extract<T, undefined>;

type IndexedFieldWithPossiblyUndefined<T, Key> = GetIndexedField<Exclude<T, undefined>, Key> | Extract<T, undefined>;

type RR<Rest extends string, Right extends string> = Rest extends '' ? Right : `${Rest}.${Right}`;

type FieldIndex<O, FieldKey extends string, Index extends string, Rest extends string> = FieldKey extends keyof O
  ? FieldWithPossiblyUndefined<O[FieldKey], `[${Index}]${Rest}`>
  : undefined;

type FieldType<O, K> = K extends keyof O
  ? O[K]
  : K extends `${infer Left}.${infer Right}`
  ? Left extends keyof O
    ? FieldWithPossiblyUndefined<O[Left], Right>
    : Left extends `[${infer Index}]${infer Rest}`
    ? FieldWithPossiblyUndefined<IndexedFieldWithPossiblyUndefined<O, Index>, RR<Rest, Right>>
    : Left extends `${infer FieldKey}[${infer Index}]${infer Rest}`
    ? FieldIndex<O, FieldKey, Index, RR<Rest, Right>>
    : undefined
  : K extends `[${infer Index}]${infer Rest}`
  ? Index extends keyof O
    ? Rest extends ''
      ? IndexedFieldWithPossiblyUndefined<O, Index>
      : FieldWithPossiblyUndefined<IndexedFieldWithPossiblyUndefined<O, Index>, Rest>
    : undefined
  : K extends `${infer FieldKey}[${infer Index}]${infer Rest}`
  ? FieldIndex<O, FieldKey, Index, Rest>
  : undefined;

export function get<Data, Path extends string, DefaultValue = FieldType<Data, Path>>(
  obj: Data,
  path: Path,
  defaultValue?: DefaultValue
): FieldType<Data, Path> | DefaultValue {
  const value = path
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce<FieldType<Data, Path>>((value, key) => (value as any)?.[key], obj as any);

  return value !== undefined ? value : (defaultValue as DefaultValue);
}

export function validatePath(path: any): void {
  const isArray = Array.isArray(path);

  if ((!isString(path) && !isArray) || path.length === 0) {
    throw new Error('A path part is not compatible');
  }

  if (isArray) {
    path.forEach(validatePath);
  }
}

export type PathParts = string | (string | PathParts)[];
export type NormalizedPath = string;

export function normalizePath(path: PathParts): NormalizedPath {
  if (isString(path)) {
    return path;
  }

  return path.map(normalizePath).join('.');
}

function isRMCModule(data: any): data is RMCCtl<any, any> {
  return isFunction(data.integrator);
}

export function combineReducers<
  T extends {
    [K in keyof T]: T[K] extends RMCCtl<any, any>
      ? T[K]
      : T[K] extends (arg: infer S | undefined, ...rest: any) => infer S
      ? T[K]
      : never;
  },
  R = {
    [K in keyof T]: T[K] extends RMCCtl<any, any>
      ? ReturnType<ReturnType<T[K]['integrator']>>
      : T[K] extends (...args: any) => any
      ? ReturnType<T[K]>
      : never;
  }
>(stateReducerMap: T, rootPath?: string): RegularReducer<R> {
  return function (state, action) {
    let changed = false;

    return Object.entries(stateReducerMap).reduce<R>((result, [path, moduleOrReducer]) => {
      const fullPath = rootPath ? normalizePath([rootPath, path]) : path;
      const ownState = get(state, path);

      const nextState = {
        ...result,
        [path]: isRMCModule(moduleOrReducer)
          ? moduleOrReducer.integrator(fullPath)(ownState, action, fullPath)
          : (moduleOrReducer as Function)(ownState, action, fullPath),
      };

      if (nextState[path] !== get(state, path)) {
        changed = true;
      }

      return changed || state === undefined ? nextState : state;
    }, {} as any);
  };
}

export function isString(str: any): str is string {
  return typeof str === 'string';
}

export function isFunction(obj: any): obj is Function {
  return typeof obj === 'function';
}

export type RMCReducer<S = any, A extends Action = any> = (state: S | undefined, action: A, path: NormalizedPath) => S;

type RegularAction = ReduxAction<string | number> & { [key: string]: any };
export type RegularRMCAction = {
  creator?: (...args: any[]) => object & { type?: never };
  type?: string | number;
  proxy?: never;
};

export type ProxyAction = {
  proxy: RMCActionCreator;
  type?: never;
  creator?: never;
};
export type RMCAction = RegularRMCAction | ProxyAction;

export interface RMCActionCreator<A extends RegularRMCAction = RegularRMCAction, R = void> {
  (...args: A['creator'] extends (...args: any) => infer R ? Parameters<A['creator']> : []): (A['creator'] extends (
    ...args: any
  ) => any
    ? ReturnType<A['creator']>
    : {}) & { type: string };

  actionType: string;
}

export function isProxyAction(action: RMCAction): action is ProxyAction {
  return action.proxy !== undefined;
}

export function generateActionType(origin: string): string {
  return `${origin}_${nanoid()}`;
}

export type ReducerThisType<
  R extends { new (...args: any[]): RMCCtl<any, Record<string, RMCAction>> },
  A extends Record<string, RMCAction>
> = ReturnType<typeof createModule<R, A>>;
export type ReducerActionsType<A extends Record<string, RMCAction>> = {
  [AN in keyof A]: A[AN] extends RegularRMCAction
    ? A[AN]['creator'] extends (...args: any) => any
      ? ReturnType<A[AN]['creator']> & { type: string }
      : { type: string }
    : A[AN] extends ProxyAction
    ? ReturnType<A[AN]['proxy']> & { type: string }
    : never;
};
