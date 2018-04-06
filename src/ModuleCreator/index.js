import {get, cloneDeep, isNil, isFunction, isString, isArray, isEqual, isEmpty} from "lodash";

import {InsufficientDataError, WrongInterfaceError, InvalidParamsError, DuplicateError} from "../lib/baseErrors";

let isStoreLinked = false;
export function linkStore(globalStore) {
  if (isStoreLinked) {
    throw new DuplicateError("Attempt to link store twice");
  }

  isStoreLinked = true;

  for (const module of modulesList) {
    module.__initializeMdl(globalStore);
  }
}

export function unlinkStore() {
  if (!isStoreLinked) {
    throw new InsufficientDataError("Attempt to unlink not linked store");
  }

  isStoreLinked = false;

  for (const module of modulesList) {
    module.deinitialize();
  }
}

export class RMCCtl {
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
  }

  __deinitializeCtl() {
    this.__unsubscribeStoreCtl();
  }

  __getOwnStateCtl(outerState = this.__storeCtl.getState()) {
    const path = this.__pathCtl;

    return get(outerState, path);
  }

  // bypassing proxy
  __setOwnStateCtl = state => {
    this.ownState = state;
  };

  __stateUpdateListenerCtl(nextOuterState) {
    const prevOwnState = this.ownState;

    const ownState = this.__getOwnStateCtl(nextOuterState);

    this.__setOwnStateCtl(ownState);

    if (isFunction(this._stateDidUpdate) && !isEqual(ownState, prevOwnState)) {
      this._stateDidUpdate(prevOwnState);
    }

    this.__stateChangeListeners.forEach(listener => {
      listener(prevOwnState, ownState);
    });
  }

  __unsubscribeCtl(listener) {
    this.__stateChangeListeners.delete(listener);
  }

  subscribe(listener) {
    if (!isFunction(listener)) {
      throw new InvalidParamsError("Attempt to subscribe, but listener is not a function");
    }

    this.__stateChangeListeners.add(listener);

    return this.__unsubscribeCtl.bind(this, listener);
  }

  dispatch(action) {
    this.__storeCtl.dispatch(action);
  }
}

const deprecatedMethodsForCtl = [
  "__validateControllerMdl",
  "__initializeMdl",
  "__pathMdl",
  "__reducerMdl",
  "__controllerMdl",
];
const warnMethodsForCtl = ["deinitialize", "integrator"];
class Module {
  constructor(reducer, CtlClass) {
    if (!isFunction(reducer)) {
      const msg = "Attempt to create a module, but reducer is not a function";

      throw new InvalidParamsError(msg);
    }

    if (!(CtlClass.prototype instanceof RMCCtl)) {
      const msg = `Attempt to create a module with a wrong ctl class "${CtlClass.name}"`;

      throw new InvalidParamsError(msg);
    }

    this.__pathMdl = undefined;
    this.__reducerMdl = reducer;
    this.__controllerMdl = new CtlClass();

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
    // keep `this = proxy` for controller`s method
    this.__controllerMdl.__initializeCtl.call(this, store, this.__pathMdl);
  }

  deinitialize() {
    // keep `this = proxy` for controller`s method
    this.__controllerMdl.__deinitializeCtl.call(this);
  }

  integrator(path) {
    const prevPath = this.__pathMdl;

    if (isNil(prevPath)) {
      if (
        (!isString(path) || path === "") &&
        (!isArray(path) || isEmpty(path) || path.some(pathPart => !isString(pathPart)))
      ) {
        throw new InvalidParamsError(`Attempt to integrate bad path: "${path}"`);
      }

      this.__pathMdl = path;
    } else if (!isEqual(prevPath, path)) {
      const msg = `Attempt to change a path of integration: "${prevPath}" -> "${path}"`;

      throw new InvalidParamsError(msg);
    }

    return this.__reducerMdl;
  }
}

const modulesList = [];

export function createModule(reducer, Controller) {
  const module = new Module(reducer, Controller);

  const proxy = new Proxy(module, {
    get(target, propName) {
      if (this._useTarget(target, propName)) {
        return target[propName];
      }

      if (propName === "ownState") {
        return cloneDeep(target.__controllerMdl[propName]);
      }

      return target.__controllerMdl[propName];
    },

    set(target, propName, value) {
      if (this._useTarget(target, propName)) {
        target[propName] = value;
      } else if (propName !== "ownState") {
        target.__controllerMdl[propName] = value;
      } else {
        return false;
      }

      return true;
    },

    _useTarget(target, propName) {
      const isProtected = propName[0] === "_";
      const isPrivate = isProtected && propName[1] === "_";

      return (isPrivate || !isProtected) && propName in target;
    }
  });

  modulesList.push(proxy);

  return proxy;
}
