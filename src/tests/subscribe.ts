import { Action } from 'redux';

import { RMCCtl } from '../';

type State = {
  prop: string;
};

function rmcReducer(state: State = { prop: '' }, action: Action, path: string) {
  return state;
}

const emptyActions = {};

class Test0 extends RMCCtl<State, typeof emptyActions> {}

const test0 = new Test0(rmcReducer, emptyActions);

// it`s ok
test0.subscribe((prevOwnState: State, ownState: State) => {});

// @ts-expect-error if no subscriber specified
test0.subscribe();
// @ts-expect-error with a not function subscriber
test0.subscribe(true);
// @ts-expect-error with a not function subscriber
test0.subscribe({});
// @ts-expect-error with wrong subscriber function type
test0.subscribe((prevOwnState: 'not state') => {});
// @ts-expect-error with wrong subscriber function type
test0.subscribe((prevOwnState: State, ownState: boolean) => {});
// @ts-expect-error with wrong subscriber function type
test0.subscribe((prevOwnState: State, ownState: State, some: boolean) => {});
