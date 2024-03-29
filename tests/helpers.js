import { nanoid } from 'nanoid/non-secure';

import { createStore, createModule } from '../dist';

export function getActionCreator() {
  const type = `action_${nanoid()}`;

  const actionCreator = function (payload) {
    return {
      type,
      payload,
    };
  };

  actionCreator.actionType = type;

  return actionCreator;
}

export function creator(Ctl, reducer, modulePath = getUniquePath()) {
  const ctlParams = [];
  const module = createModule({ Ctl, ctlParams, reducer, actions: {} });

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
