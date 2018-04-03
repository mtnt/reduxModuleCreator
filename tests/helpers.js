import {uniqueId} from 'lodash';

import {createStore, createModule} from "../src";


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

export function creator(reducer, ctl, modulePath = "modulePath") {
  const module = createModule(reducer, ctl);

  function rootReducer(state = {}, action) {
    return {
      [modulePath]: module.integrator(modulePath)(state[modulePath], action),
    };
  }

  createStore(rootReducer);

  return module;
}
