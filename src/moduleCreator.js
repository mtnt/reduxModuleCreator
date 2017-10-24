import {get, isNil, isFunction, isString, isArray} from 'lodash';

import {
    InsufficientDataError,
    WrongInterfaceError,
    InvalidParamsError,
    DuplicateError,
} from './lib/baseErrors';


let store;

export function linkStore(globalStore) {
    if (!isNil(store)) {
        throw new DuplicateError('Attempt to link store twice');
    }

    store = globalStore;
}

export function unlinkStore() {
    store = null;
}

export class Ctl {
    constructor(path) {
        this._path = path;
        this._state = this._getState();

        this._unsubscribeStore = store.subscribe(() => {
            this._stateUpdateListener(store.getState());
        });
    }

    destructor() {
        this._unsubscribeStore();
    }

    dispatch(action) {
        store.dispatch(action);
    }

    _getState(outerState = store.getState()) {
        return get(outerState, this._path);
    }

    _stateUpdateListener = (nextOuterState) => {
        if (isNil(this.stateDidUpdate)) {
            throw new WrongInterfaceError('A controller must have `stateDidUpdate` method');
        }

        const prevState = this._state;

        this._state = this._getState(nextOuterState);

        if (this._state !== prevState) {
            this.stateDidUpdate(this._state);
        }
    };
}

class Module {
    constructor(reducer, Controller) {
        if (!isFunction(reducer)) {
            const msg = 'Attempt to create a module, but reducer is not a function';

            throw new InvalidParamsError(msg);
        }

        if (!(Controller.prototype instanceof Ctl)) {
            const msg = `Attempt to create a module with a wrong ctl class "${Controller.name}"`;

            throw new InvalidParamsError(msg);
        }

        this._reducer = reducer;
        this._controllerClass = Controller;
    }

    integrator(path) {
        if (
            (!isString(path) || path === '') &&
            (!isArray(path) || path.some(pathPart => !isString(pathPart)))
        ) {
            throw new InvalidParamsError(`Attempt to integrate bad path: "${path}"`);
        }

        this._path = path;

        return this._reducer;
    };

    getController() {
        const path = this._path;

        if (isNil(path)) {
            const msg = `A module controller can\`t be constructed because of path: "${path}"`;

            throw new InsufficientDataError(msg);
        }

        const ctl = new this._controllerClass(path);

        if (!isFunction(ctl.stateDidUpdate)) {
            throw new WrongInterfaceError('A controller must have `stateDidUpdate` method');
        }

        return ctl;
    }
}

export function createModule(reducer, Controller) {
    return new Module(reducer, Controller);
}
