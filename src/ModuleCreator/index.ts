import { AnyAction, Reducer as RegularReducer, Store as GlobalStore } from "redux";

import { DuplicateError, InsufficientDataError, InvalidParamsError, WrongInterfaceError } from '../lib/baseErrors';
import {
  get,
  isFunction, isProxyAction, isString,
  NormalizedPath,
  normalizePath,
  PathParts,
  RMCAction,
  RMCReducer,
  validatePath,
  generateActionType, RMCActionCreator, RegularRMCAction
} from "../Utils";

const modulesList: RMCCtl<any, any>[] = [];

let isStoreLinked = false;
export function linkStore(globalStore: GlobalStore) {
  if (isStoreLinked) {
    throw new DuplicateError('Attempt to link store twice');
  }

  isStoreLinked = true;

  for (const module of modulesList) {
    module.__initialize_RMC(globalStore);
  }
}

export function unlinkStore() {
  switch (process.env.NODE_ENV) {
    case 'production': {
      const msg =
        'It`s not possible to unlink a store on production. It may cause unpredictable issues related to' +
        ' dependency breaks';

      throw new WrongInterfaceError(msg);
    }

    case 'development': {
      console.warn('The deprecated method unlinkStore was called. It will cause an exception in production mode.');
    }
  }

  if (!isStoreLinked) {
    throw new InsufficientDataError('Attempt to unlink not linked store');
  }

  isStoreLinked = false;

  for (const module of modulesList) {
    module.__deinitialize_RMC();
  }
}

function getObjEntries<T extends {[key: string]: any}>(obj: T): {
  [K in keyof T]: [K, T[K]];
}[keyof T][] {
  return Object.entries(obj) as any
}

export class RMCCtl<
  S,
  A extends Record<string, RMCAction>,
  R extends RMCReducer<S> | RegularReducer<S> = RMCReducer<S> | RegularReducer<S>,
  SBS extends (prevOwnState: S, ownState: S) => any = (prevOwnState: S, ownState: S) => any
> {
  #path?: NormalizedPath;
  #store?: GlobalStore;
  readonly #reducer;
  #ownState!: S;

  #stateChangeListeners = new Set<SBS>();
  #unsubscribeStore?: ReturnType<GlobalStore['subscribe']>

  protected stateDidUpdate?: (prevOwnState: S) => any
  protected didLinkedWithStore?: () => any
  protected didUnlinkedWithStore?: () => any

  actions!: {
    [AN in keyof A]: A[AN] extends RegularRMCAction ? RMCActionCreator<A[AN]> : A[AN]['proxy']
  }

  constructor(reducer: R, actions: A) {
    this.#reducer = reducer.bind(this);

    let actionEntries = getObjEntries(actions);

    actionEntries.forEach(([actionName, action]) => {
      if (isProxyAction(action)) {
        const { proxy } = action

        if (!isFunction(proxy) || !isString(proxy.actionType) || proxy.actionType === '') {
          throw new InvalidParamsError(
            `Proxy type for "${String(actionName)}" is not a function or has not an actionType: "${proxy}"`
          );
        }

        this.actions[actionName] = action.proxy;
      } else {
        const { creator = () => ({}), type } = action

        if (!isFunction(creator)) {
          throw new InvalidParamsError(`Action creator for "${String(actionName)}" is not a function: "${creator}"`);
        }
        if ((!isString(type) || type.length === 0)) {
          throw new InvalidParamsError(`Action type for "${String(actionName)}" is not a string: "${type}"`);
        }

        const generatedType = generateActionType(type);

        const actionCreator = <A extends []>(...args: A): any => {
          const action = {...creator(...args), type: generatedType};

          this.#dispatch(action);

          return action
        };
        actionCreator.actionType = generatedType;

        this.actions[actionName] = actionCreator
      }
    });
  }

  #getOwnState(outerState: GlobalStore) {
    if (this.#path === undefined) {
      throw new InsufficientDataError('You need to call the `integrator` at first');
    }

    return get(outerState, this.#path) as S;
  }

  #dispatch(action: AnyAction) {
    if (!this.#store) {
      throw new WrongInterfaceError('Can not dispatch while store is not linked');
    }

    this.#store.dispatch(action);
  }

  #stateUpdateListener(nextOuterState: GlobalStore) {
    const prevOwnState = this.ownState;

    this.#ownState = this.#getOwnState(nextOuterState);

    if (this.#ownState === prevOwnState) {
      return;
    }

    if (this.stateDidUpdate !== undefined) {
      this.stateDidUpdate(prevOwnState);
    }

    this.#stateChangeListeners.forEach(listener => {
      listener(prevOwnState, this.#ownState);
    });
  }

  #unsubscribe(listener: SBS) {
    this.#stateChangeListeners.delete(listener);
  }

  subscribe(listener: SBS extends (prevOwnState: S, ownState: S) => any ? SBS : never) {
    if (!isFunction(listener)) {
      throw new InvalidParamsError('Attempt to subscribe, but listener is not a function');
    }

    this.#stateChangeListeners.add(listener);

    return this.#unsubscribe.bind(this, listener);
  }

  get ownState() {
    return this.#ownState;
  }

  __initialize_RMC(store: GlobalStore) {
    this.#store = store;

    this.#ownState = this.#getOwnState(this.#store);

    this.#unsubscribeStore = this.#store.subscribe(() => {
      if (this.#store === undefined) {
        throw new Error('This is impossible... I will be so surprisingly if it will happens');
      }
      const state = this.#store.getState();

      this.#stateUpdateListener(state);
    });

    if (this.didLinkedWithStore !== undefined) {
      this.didLinkedWithStore();
    }
  }

  __deinitialize_RMC() {
    if (this.#unsubscribeStore !== undefined) {
      this.#unsubscribeStore();
    }

    this.#store = undefined;

    if (this.didUnlinkedWithStore !== undefined) {
      this.didUnlinkedWithStore();
    }
  }

  integrator(path: PathParts) {
    try {
      validatePath(path);
    } catch (e) {
      throw new InvalidParamsError(`Attempt to integrate bad path: "${path}"`);
    }

    const prevPath = this.#path;
    const nextPath = normalizePath(path);

    if (!prevPath) {
      this.#path = nextPath;
    } else if (nextPath !== prevPath) {
      const msg = `Attempt to change a path of integration: "${prevPath}" -> "${path}"`;

      throw new InvalidParamsError(msg);
    }

    return this.#reducer;
  }
}

type ExcludeTuples<TupleA, TupleB> = TupleA extends TupleB
  ? []
  : TupleA extends [infer Head, ...infer Rest]
  ? [Head, ...(Rest extends TupleB ? [] : ExcludeTuples<Rest, TupleB>)]
  : [];

export function createModule<
  CTL extends { new (...args: any[]): any },
  A extends Record<string, RMCAction> = any,
  R extends RMCReducer | RegularReducer = any,
>({
  Ctl: CtlClass,
  ctlParams,
  reducer,
  actions,
}: {
  Ctl: CTL extends { new (...args: any[]): RMCCtl<ReturnType<R>, A> } ? CTL : never;
  ctlParams: ExcludeTuples<ConstructorParameters<CTL>, ConstructorParameters<typeof RMCCtl<ReturnType<R>, A>>>;
  reducer: R extends (arg: infer S | undefined, ...rest: any) => infer S ? R : never;
  actions: A;
}): InstanceType<CTL> & {
  [AN in keyof A]: InstanceType<CTL>[AN] extends (...args: any) => any ? InstanceType<CTL>[AN] : A[AN] extends RegularRMCAction ? RMCActionCreator<A[AN]> : A[AN]['proxy']
} {
  if (!isFunction(reducer)) {
    const msg = 'Attempt to create a module, but reducer is not a function';

    throw new InvalidParamsError(msg);
  }

  if (typeof actions !== 'object' || Array.isArray(actions) || actions === null) {
    const msg = 'Attempt to create a module, but actions is not an object';

    throw new InvalidParamsError(msg);
  }

  if (!CtlClass) {
    const msg = `Attempt to create a module without a ctl class`;

    throw new InvalidParamsError(msg);
  }

  if (!(CtlClass.prototype instanceof RMCCtl)) {
    const msg = `Attempt to create a module with a wrong ctl class "${CtlClass.name}"`;

    throw new InvalidParamsError(msg);
  }

  if (!Array.isArray(ctlParams)) {
    const msg = `Attempt to create a module with a wrong ctl params. It MUST be an array.`;

    throw new InvalidParamsError(msg);
  }

  const module = new CtlClass(...ctlParams, reducer, actions);

  getObjEntries(module.actions).forEach(([key, value]) => {
    if (module[key] === undefined) {
      module[key] = value
    }
  })

  modulesList.push(module);

  return module;
}
