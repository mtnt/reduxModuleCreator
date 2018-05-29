import {createStore as reduxCreateStore} from "redux";
import {forEach, isFunction, get} from "lodash";

import {linkStore, unlinkStore, createModule, RMCCtl} from "./ModuleCreator";

function createStore(rootReducer, preloadedState, enhancer) {
  const store = reduxCreateStore(rootReducer, preloadedState, enhancer);

  linkStore(store);

  return store;
}

function combineReducers(stateReducerMap) {
  return function(state, action) {
    let changed = false;

    const nextState = {};
    forEach(stateReducerMap, (module, path) => {
      if (isFunction(module.integrator)) {
        nextState[path] = module.integrator(path)(get(state, path), action, path);
      } else {
        nextState[path] = module(get(state, path), action);
      }

      if (nextState[path] !== get(state, path)) {
        changed = true;
      }
    });

    return changed ? nextState : state;
  };
}

export {createModule, RMCCtl, createStore, linkStore, unlinkStore, combineReducers};
