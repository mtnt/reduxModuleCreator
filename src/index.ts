import { createStore as reduxCreateStore, StoreCreator } from 'redux';

import { linkStore, unlinkStore, createModule, RMCCtl, clearModules } from './ModuleCreator';
import { combineReducers, ReducerThisType, ReducerActionsType, RMCAction } from './Utils';
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

type Module<A extends Record<string, RMCAction> = any> = ReturnType<
  typeof createModule<{ new (...args: any[]): RMCCtl<any, A> }, A>
>;

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
  type Module,
  type ReducerThisType,
  type ReducerActionsType,
};
