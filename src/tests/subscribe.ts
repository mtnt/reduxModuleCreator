import { ReducerActionsType, ReducerThisType, RMCCtl } from '../';

type State = {
  prop: string;
};
const actions0 = {
  test: {
    creator: () => ({ payload: 1 }),
    type: 'test',
  },
};

type ActionsType0 = ReducerActionsType<typeof actions0>;

function reducer0(
  this: ReducerThisType<typeof Test0, typeof actions0>,
  state: State = { prop: 'true' },
  action: ActionsType0[keyof ActionsType0]
): State {
  return state;
}

class Test0 extends RMCCtl<State, typeof actions0> {}

const test0 = new Test0(reducer0, actions0);

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
