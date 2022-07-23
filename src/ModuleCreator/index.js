import { nanoid } from 'nanoid/non-secure';

import { DuplicateError, InsufficientDataError, InvalidParamsError, WrongInterfaceError } from '../lib/baseErrors';
import { get, isFunction, isString, normalizePath, validatePath } from '../Utils';

let isStoreLinked = false;
export function linkStore(globalStore) {
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

function generateActionType(origin, uniquePostfix) {
  return `${origin}_${uniquePostfix}`;
}

export class RMCCtl {
  #uniquePostfix = `up_${nanoid()}`;
  #unsubscribeStore = undefined;
  #path = undefined;
  #store = undefined;
  #reducer = undefined;
  #ownState;
  #stateChangeListeners = new Set();

  actions = {};

  constructor(reducer, actions) {
    this.#reducer = reducer.bind(this);

    let actionEntries = Object.entries(actions);

    actionEntries.forEach(([actionName, { creator = () => ({}), type = 'auto_generated_type_base', proxy }]) => {
      const haveProxy = proxy !== undefined;
      if (haveProxy && (!isFunction(proxy) || !isString(proxy.actionType) || proxy.actionType.length === '')) {
        throw new InvalidParamsError(
          `Proxy type for "${actionName}" is not a function or has not an actionType: "${proxy}"`
        );
      }

      if (!haveProxy && !isFunction(creator)) {
        throw new InvalidParamsError(`Action creator for "${actionName}" is not a function: "${creator}"`);
      }
      if (!haveProxy && (!isString(type) || type.length === 0)) {
        throw new InvalidParamsError(`Action type for "${actionName}" is not a string: "${type}"`);
      }

      if (haveProxy) {
        this.actions[actionName] = proxy;
      } else {
        const generatedType = generateActionType(type, this.#uniquePostfix);

        this.actions[actionName] = (...args) => {
          const action = creator(...args);

          action.type = generatedType;

          this.#dispatch(action);
        };
        this.actions[actionName].actionType = generatedType;
      }

      if (this[actionName] === undefined) {
        this[actionName] = this.actions[actionName];
      }
    });
  }

  #getOwnState(outerState = this.#store.getState()) {
    const path = this.#path;

    return get(outerState, path);
  }

  #stateUpdateListener(nextOuterState) {
    const prevOwnState = this.ownState;

    this.#ownState = this.#getOwnState(nextOuterState);

    if (this.#ownState === prevOwnState) {
      return;
    }

    this.stateDidUpdate(prevOwnState);

    this.#stateChangeListeners.forEach(listener => {
      listener(prevOwnState, this.#ownState);
    });
  }

  #dispatch(action) {
    if (!this.#store) {
      throw new WrongInterfaceError('Can not dispatch while store is not linked');
    }

    this.#store.dispatch(action);
  }

  #unsubscribe(listener) {
    this.#stateChangeListeners.delete(listener);
  }

  stateDidUpdate() {}

  didLinkedWithStore() {}

  didUnlinkedWithStore() {}

  get ownState() {
    if (this.#store === undefined) {
      return;
    }

    return this.#ownState;
  }

  subscribe(listener) {
    if (!isFunction(listener)) {
      throw new InvalidParamsError('Attempt to subscribe, but listener is not a function');
    }

    this.#stateChangeListeners.add(listener);

    return this.#unsubscribe.bind(this, listener);
  }

  integrator(path) {
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

  __initialize_RMC(store) {
    this.#store = store;

    this.#ownState = this.#getOwnState();

    this.#unsubscribeStore = this.#store.subscribe(() => {
      const state = this.#store.getState();

      this.#stateUpdateListener(state);
    });

    this.didLinkedWithStore();
  }

  __deinitialize_RMC() {
    this.#unsubscribeStore();

    this.#store = undefined;

    this.didUnlinkedWithStore();
  }
}

const modulesList = [];

export function createModule({ Ctl: CtlClass, ctlParams = [], reducer, actions }) {
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

  modulesList.push(module);

  return module;
}
