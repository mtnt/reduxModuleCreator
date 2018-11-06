import {isFunction, get} from "lodash";

export function combineReducers(stateReducerMap) {
  return function(state, action) {
    let changed = false;

    const nextState = {};
    Object.entries(stateReducerMap).forEach(([path, module]) => {
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
