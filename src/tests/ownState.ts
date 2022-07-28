import { Action } from 'redux';

import { RMCCtl, createModule } from '../';

type State = { prop0: boolean; prop1: string };

class Test extends RMCCtl<State, {}> {
  getOwnState() {
    return this.ownState;
  }
}

function reducer(state: State = { prop0: true, prop1: '' }, action: Action) {
  return state;
}

const testMdl = createModule({
  Ctl: Test,
  ctlParams: [],
  reducer,
  actions: {},
});

// it`s ok
const test0 = testMdl.getOwnState();

// @ts-expect-error
test0.#ownState;
// @ts-expect-error
test0.ownState;

class Test1 extends RMCCtl<State, {}> {
  setOwnState() {
    // @ts-expect-error if try to set ownState
    this.ownState = '';
  }
}
