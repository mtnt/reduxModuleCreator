import uniqueId from 'lodash.uniqueid';

import {createStore, createModule} from '../src';

export function getActionCreator() {
  const type = uniqueId('action');

  const actionCreator = function(payload) {
    return {
      type,
      payload,
    };
  };

  actionCreator.type = type;

  return actionCreator;
}

export function creator(Ctl, reducer, modulePath = getUniquePath()) {
  const module = createModule({Ctl, reducer});

  function rootReducer(state = {}, action) {
    return {
      [modulePath]: module.integrator(modulePath)(state[modulePath], action),
    };
  }

  createStore(rootReducer);

  return module;
}

export function getUniquePath() {
  return uniqueId('modulePath');
}
