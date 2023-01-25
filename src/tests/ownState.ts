import { RMCCtl, createModule, type ReducerActionsType, type ReducerThisType } from '../';

type State = { prop0: boolean; prop1: string };

const actions0 = {
  a: {
    creator: () => ({}),
    type: 1,
  },
};

type ActionsType0 = ReducerActionsType<typeof actions0>;

class Test extends RMCCtl<State, typeof actions0> {
  getOwnState() {
    return this.ownState;
  }
}

function reducer(
  this: ReducerThisType<typeof Test, typeof actions0>,
  state: State = { prop0: true, prop1: '1' },
  action: ActionsType0[keyof ActionsType0]
) {
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

class Test1 extends RMCCtl<State, typeof actions0> {
  setOwnState() {
    // @ts-expect-error if try to set ownState
    this.ownState = '';
  }
}
