import { Action } from 'redux';

import { createStore, combineReducers } from '../';

type State = {
  prop0: string;
  prop1: number;
};

function reducer(state: State = { prop0: '', prop1: 3 }, action: Action) {
  return state;
}

const rootReducer = combineReducers({
  foo: reducer,
});

// @ts-expect-error: wrong enhancer/preloadedState
createStore(rootReducer, []);
// @ts-expect-error: wrong enhancer/preloadedState
createStore(rootReducer, '');
// @ts-expect-error: wrong enhancer
createStore(rootReducer, undefined, []);
// @ts-expect-error: wrong enhancer
createStore(rootReducer, {}, {});
