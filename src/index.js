import {createStore as reduxCreateStore} from 'redux';

import {linkStore, unlinkStore, createModule, RMCCtl} from './ModuleCreator';


function createStore(rootReducer, preloadedState, enhancer) {
    const store = reduxCreateStore(rootReducer, preloadedState, enhancer);

    linkStore(store);

    return store;
}

export {createModule, RMCCtl, createStore, linkStore, unlinkStore};
