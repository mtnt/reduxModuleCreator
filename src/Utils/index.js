import get from "lodash.get";
import isFunction from "lodash.isfunction";

export function combineReducers(stateReducerMap, rootPath) {
  return function(state, action) {
    let changed = false;

    const nextState = {};
    Object.entries(stateReducerMap).forEach(([path, module]) => {
      const fullPath = rootPath ? `${rootPath}.${path}` : path;
      const ownState = get(state, path);

      if (isFunction(module.integrator)) {
        nextState[path] = module.integrator(fullPath)(ownState, action, fullPath);
      } else {
        nextState[path] = module(ownState, action, fullPath);
      }

      if (nextState[path] !== get(state, path)) {
        changed = true;
      }
    });

    return changed ? nextState : state;
  };
}
