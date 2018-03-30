import {get, cloneDeep, isNil, isFunction, isString, isArray, isEqual, isEmpty} from 'lodash';

import {
    InsufficientDataError,
    WrongInterfaceError,
    InvalidParamsError,
    DuplicateError,
} from '../lib/baseErrors';

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
  if (!isStoreLinked) {
    throw new InsufficientDataError("Attempt to unlink not linked store")
  }

  isStoreLinked = false;

  for (const module of modulesList) {
    module.deinitialize();
  }
}

export class RMCCtl {
    constructor() {
        if (!isFunction(this._stateDidUpdate)) {
            throw new WrongInterfaceError('A controller must have `_stateDidUpdate` method');
        }
    }

    __initializeCtl(store, path) {
        this.__storeCtl = store;
        this.__pathCtl = path;
        this.ownState = this.__getOwnStateCtl();

        this.__unsubscribeStoreCtl = this.__storeCtl.subscribe(() => {
            const state = this.__storeCtl.getState();

            this.__stateUpdateListenerCtl(state);
        });
    }

    __deinitializeCtl() {
        this.__unsubscribeStoreCtl();
    }

    __getOwnStateCtl(outerState = this.__storeCtl.getState()) {
        return get(outerState, this.__pathCtl);
    }

    __stateUpdateListenerCtl = (nextOuterState) => {
        const prevOwnState = this.ownState;

        this.ownState = this.__getOwnStateCtl(nextOuterState);

        if (!isEqual(this.ownState, prevOwnState)) {
            this._stateDidUpdate(cloneDeep(prevOwnState));
        }
    };

    dispatch(action) {
        this.__storeCtl.dispatch(action);
    }
}

const deprecatedMethodsForCtl = [
  '__validateControllerMdl',
  '__initializeMdl',
  '__pathMdl',
  '__reducerMdl',
  '__controllerMdl',
];
const warnMethodsForCtl = [
  'deinitialize',
  'integrator',
];
class Module {
    constructor(reducer, CtlClass) {
        if (!isFunction(reducer)) {
          const msg = 'Attempt to create a module, but reducer is not a function';

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
      this.__controllerMdl.__initializeCtl(store, this.__pathMdl);
    }

    deinitialize() {
        this.__controllerMdl.__deinitializeCtl();
    }

    integrator(path) {
        if (
            (!isString(path) || path === '') &&
            (!isArray(path) || isEmpty(path) || path.some(pathPart => !isString(pathPart)))
        ) {
            throw new InvalidParamsError(`Attempt to integrate bad path: "${path}"`);
        }

        if (!isNil(this.__pathMdl) && !isEqual(this.__pathMdl, path)) {
            const msg = `Attempt to change a path of integration: "${this.__pathMdl}" -> "${path}"`;

            throw new InvalidParamsError(msg);
        }

        this.__pathMdl = path;

        return this.__reducerMdl;
    };
}

const modulesList = [];

export function createModule(reducer, Controller) {
  const module = new Module(reducer, Controller);

  modulesList.push(module);

  return new Proxy(module, {
    get(target, propName) {
      const isProtected = propName[0] === '_';
      const isPrivate = isProtected && propName[1] === '_';

      if (isPrivate && propName in target) {
        return target[propName];
      }

      if (!isProtected && propName in target) {
        return target[propName];
      }

      return target.__controllerMdl[propName];
    }
  });
}
