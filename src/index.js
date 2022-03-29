import { createStore as reduxCreateStore } from 'redux';

import { linkStore, unlinkStore, createModule, RMCCtl } from './ModuleCreator';
import { combineReducers } from './Utils';

function createStore(...args) {
  const store = reduxCreateStore(...args);

  linkStore(store);

  return store;
}

export { createModule, RMCCtl, createStore, linkStore, unlinkStore, combineReducers };
