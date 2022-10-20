import { createStore as reduxCreateStore, StoreCreator } from 'redux';

import { linkStore, unlinkStore, createModule, RMCCtl, clearModules } from './ModuleCreator';
import { combineReducers, ReducerThisType, ReducerActionsType } from './Utils';
import {
  RMCError,
  InvalidParamsError,
  WrongInterfaceError,
  DuplicateError,
  InsufficientDataError,
} from './lib/baseErrors';

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
  clearModules,
  RMCError,
  InvalidParamsError,
  WrongInterfaceError,
  DuplicateError,
  InsufficientDataError,
  ReducerThisType,
  ReducerActionsType,
};
