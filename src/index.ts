import { createStore as reduxCreateStore, StoreCreator } from 'redux';

import { linkStore, unlinkStore, createModule, RMCCtl } from './ModuleCreator';
import { combineReducers, ReducerThisType, ReducerActionsType } from './Utils';

const createStore: StoreCreator = (
  ...args: Parameters<typeof reduxCreateStore>
): ReturnType<typeof reduxCreateStore> => {
  const store = reduxCreateStore(...args);

  linkStore(store);

  return store;
};

export {
  createModule,
  RMCCtl,
  createStore,
  linkStore,
  unlinkStore,
  combineReducers,
  ReducerThisType,
  ReducerActionsType,
};
