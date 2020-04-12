import {pathDelimiter} from '../lib/constansts';

export function get(obj, path, def) {
  try {
    let arrPath = path;
    if (!Array.isArray(path)) {
      arrPath = path.split(pathDelimiter);
    }

    const firstPathPart = arrPath[0];
    const nextObj = obj[firstPathPart];

    return arrPath.length === 1 ? nextObj : get(nextObj, arrPath.slice(1));
  } catch (e) {
    return def;
  }
}

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
    if (Object.keys(stateReducerMap).length === 0) {
      return Object.keys(state).length === 0 ? state : {};
    }

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

export function isFunction(obj) {
  return typeof obj === 'function';
}
