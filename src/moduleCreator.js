import {get, isNil} from 'lodash';

import {InsufficientDataError, WrongInterfaceError, InvalidParamsError} from './lib/baseErrors';


let store;

export function linkStore(globalStore) {
    store = globalStore;
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
            this.stateDidUpdate(prevState);
        }
    };
}

class Module {
    constructor(reducer, Controller) {
        if (!(Controller.prototype instanceof Ctl)) {
            const msg = `Attempt to create a module with a wrong ctl class "${Controller.name}"`;

            throw new InvalidParamsError(msg);
        }

        this._reducer = reducer;
        this._controllerClass = Controller;
    }

    integrator(path) {
        this._path = path;

        return this._reducer;
    };

    getController() {
        const path = this._path;

        if (isNil(path)) {
            const msg = `A module controller can\`t be constructed because of path: "${path}"`;

            throw new InsufficientDataError(msg);
        }

        return new this._controllerClass(path);
    }
}

export function createModule(reducer, Controller) {
    return new Module(reducer, Controller);
}
