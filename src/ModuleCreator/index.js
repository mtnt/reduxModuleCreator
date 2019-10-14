import nanoid from 'nanoid/non-secure';

import {InsufficientDataError, WrongInterfaceError, InvalidParamsError, DuplicateError} from '../lib/baseErrors';
import {validatePath, normalizePath, isString, isFunction, get} from '../Utils';

let isStoreLinked = false;
export function linkStore(globalStore) {
  if (isStoreLinked) {
    throw new DuplicateError('Attempt to link store twice');
  }

  isStoreLinked = true;

  for (const module of modulesList) {
    module.__initializeMdl(globalStore);
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
    module.__deinitialize();
  }
}

function generateActionType(origin, uniquePostfix) {
  return `${origin}_${uniquePostfix}`;
}

export class RMCCtl {
  constructor(actions) {
    this.__writable = false;
    this.__uniquePostfix = `up_${nanoid()}`;

    let ownProperty;
    Object.defineProperty(this, 'ownState', {
      get() {
        if (!this.__storeCtl) {
          return;
        }

        return ownProperty;
      },
      set(value) {
        if (!this.__writable) {
          throw new WrongInterfaceError('Attempt to set ownState. This property changes via dispatching actions only.');
        }

        ownProperty = value;
      },
    });

    this.actions = {};
    Object.entries(actions).forEach(([actionName, {creator = () => ({}), type, proxy}]) => {
      if (isFunction(proxy)) {
        this.actions[actionName] = proxy;
      } else {
        if (!isFunction(creator)) {
          throw new InvalidParamsError(`Action creator for "${actionName}" is not a function: "${creator}"`);
        }
        if (!isString(type) || type.length === 0) {
          throw new InvalidParamsError(`Action type for "${actionName}" is not a string: "${type}"`);
        }

        const generatedType = generateActionType(type, this.__uniquePostfix);

        this.actions[actionName] = (...args) => {
          const action = creator(...args);

          action.type = generatedType;

          this.__dispatch(action);
        };
        this.actions[actionName].actionType = generatedType;

        if (typeof this[actionName] === 'undefined') {
          this[actionName] = this.actions[actionName];
        }
      }
    });
  }

  __stateChangeListeners = new Set();

  __initializeCtl(store, path) {
    this.__storeCtl = store;
    this.__pathCtl = path;

    const ownState = this.__getOwnStateCtl();
    this.__setOwnStateCtl(ownState);

    this.__unsubscribeStoreCtl = this.__storeCtl.subscribe(() => {
      const state = this.__storeCtl.getState();

      this.__stateUpdateListenerCtl(state);
    });

    if (isFunction(this._didLinkedWithStore)) {
      this._didLinkedWithStore();
    }
  }

  __deinitializeCtl() {
    this.__unsubscribeStoreCtl();

    this.__storeCtl = undefined;

    if (isFunction(this._didUnlinkedWithStore)) {
      this._didUnlinkedWithStore();
    }
  }

  __getOwnStateCtl(outerState = this.__storeCtl.getState()) {
    const path = this.__pathCtl;

    return get(outerState, path);
  }

  __setOwnStateCtl = state => {
    this.__writable = true;

    this.ownState = state;

    this.__writable = false;
  };

  __stateUpdateListenerCtl(nextOuterState) {
    const prevOwnState = this.ownState;

    const ownState = this.__getOwnStateCtl(nextOuterState);

    this.__setOwnStateCtl(ownState);

    if (ownState === prevOwnState) {
      return;
    }

    if (isFunction(this._stateDidUpdate)) {
      this._stateDidUpdate(prevOwnState);
    }

    this.__stateChangeListeners.forEach(listener => {
      listener(prevOwnState, ownState);
    });
  }

  __unsubscribeCtl(listener) {
    this.__stateChangeListeners.delete(listener);
  }

  __dispatch(action) {
    if (!this.__storeCtl) {
      throw new WrongInterfaceError('Can not dispatch while store is not linked');
    }

    this.__storeCtl.dispatch(action);
  }

  subscribe(listener) {
    if (!isFunction(listener)) {
      throw new InvalidParamsError('Attempt to subscribe, but listener is not a function');
    }

    this.__stateChangeListeners.add(listener);

    return this.__unsubscribeCtl.bind(this, listener);
  }
}

const deprecatedMethodsForCtl = [
  '__validateControllerMdl',
  '__initializeMdl',
  '__pathMdl',
  '__reducerMdl',
  '__controllerMdl',
  '__deinitialize',
];
const warnMethodsForCtl = ['integrator'];
class Module {
  constructor(reducer, actions, CtlClass, ctlParams) {
    if (!isFunction(reducer)) {
      const msg = 'Attempt to create a module, but reducer is not a function';

      throw new InvalidParamsError(msg);
    }

    if (typeof actions !== 'object' || actions === null) {
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

    this.__pathMdl = undefined;
    this.__controllerMdl = new CtlClass(...ctlParams, actions);
    this.__reducerMdl = reducer.bind(this.__controllerMdl);

    this.__validateControllerMdl(this.__controllerMdl);
  }

  __validateControllerMdl(ctl) {
    let ctlName = Object.getPrototypeOf(ctl).constructor.name;

    for (const methodName of deprecatedMethodsForCtl) {
      if (methodName in ctl) {
        const msg = `A "${ctlName}" contains a deprecated for a controller method/property "${methodName}"`;

        throw new DuplicateError(msg);
      }
    }

    for (const methodName of warnMethodsForCtl) {
      if (methodName in ctl) {
        const msg = `A "${ctlName}" contains a method/property "${methodName}" that exists in the module. You will not have access to the controllers method.`;

        console.warn(msg);
      }
    }
  }

  __initializeMdl(store) {
    this.__controllerMdl.__initializeCtl(store, this.__pathMdl);
  }

  __deinitialize() {
    this.__controllerMdl.__deinitializeCtl();
  }

  integrator(path) {
    try {
      validatePath(path);
    } catch (e) {
      throw new InvalidParamsError(`Attempt to integrate bad path: "${path}"`);
    }

    const prevPath = this.__pathMdl;
    const nextPath = normalizePath(path);

    if (!prevPath) {
      this.__pathMdl = nextPath;
    } else if (nextPath !== prevPath) {
      const msg = `Attempt to change a path of integration: "${prevPath}" -> "${path}"`;

      throw new InvalidParamsError(msg);
    }

    return this.__reducerMdl;
  }
}

const modulesList = [];

export function createModule({Ctl, ctlParams = [], reducer, actions = {}}) {
  const module = new Module(reducer, actions, Ctl, ctlParams);

  const proxy = new Proxy(module, {
    get(target, propName) {
      if (this._useTarget(target, propName)) {
        return target[propName];
      }

      const result = target.__controllerMdl[propName];
      if (isFunction(result)) {
        return result.bind(target.__controllerMdl);
      } else {
        return result;
      }
    },

    set(target, propName, value) {
      if (this._useTarget(target, propName)) {
        target[propName] = value;
      } else {
        target.__controllerMdl[propName] = value;
      }

      return true;
    },

    _useTarget(target, propName) {
      const isProtected = propName[0] === '_';
      const isPrivate = isProtected && propName[1] === '_';

      return (isPrivate || !isProtected) && propName in target;
    },
  });

  modulesList.push(proxy);

  return proxy;
}
