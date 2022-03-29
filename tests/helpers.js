import nanoid from 'nanoid/non-secure';

import {createStore, createModule} from '../src';

export function getActionCreator() {
  const type = `action_${nanoid()}`;

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
  const module = createModule({Ctl, reducer, actions: {}});

  function rootReducer(state = {}, action) {
    return {
      [modulePath]: module.integrator(modulePath)(state[modulePath], action),
    };
  }

  createStore(rootReducer);

  return module;
}

export function getUniquePath() {
  return `modulePath_${nanoid()}`;
}
