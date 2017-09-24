import {createStore as reduxCreateStore} from 'redux';

import {linkStore, createModule, Ctl} from './moduleCreator';


export function createStore(rootReducer, preloadedState, enhancer) {
    const store = reduxCreateStore(rootReducer, preloadedState, enhancer);

    linkStore(store);

    return store;
}

export {createModule, Ctl};
