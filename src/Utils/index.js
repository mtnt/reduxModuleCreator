import get from 'lodash.get';
import isFunction from 'lodash.isfunction';

import {pathDelimiter} from '../lib/constansts';

export function validatePath(path) {
  const isArray = Array.isArray(path);

  if (!isString(path) && !isArray || path.length === 0) {
    throw new Error('A path part is not compatible');
  }

  if (isArray) {
    path.forEach(validatePath);
  }
}

export function normalizePath(path) {
  if (isString(path)) {
    return path;
  }

  return path.map(normalizePath).join(pathDelimiter);
}

export function combineReducers(stateReducerMap, rootPath) {
  return function(state, action) {
    let changed = false;

    const nextState = {};
    Object.entries(stateReducerMap).forEach(([path, module]) => {
      const fullPath = rootPath ? normalizePath([rootPath, path]) : path;
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

export function isString(str) {
  return typeof str === 'string';
}
