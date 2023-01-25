import { createModule, ReducerActionsType, ReducerThisType, RMCCtl } from '../';

type State = {
  prop: boolean;
};

const actions0 = {
  a0: {
    type: 'a0',
  },
  a1: {
    creator: (a: string) => ({
      payload: {
        prop: true,
      },
    }),
    type: 1,
  },
  a2: {
    creator: (foo: string) => ({
      payload: {
        prop: foo,
      },
    }),
    type: 'a2',
  },
};

type ActionsType0 = ReducerActionsType<typeof actions0>;

function rmcReducer0(
  this: ReducerThisType<typeof Test0, typeof actions0>,
  state: State = { prop: true },
  action: ActionsType0[keyof ActionsType0],
  path: string
): State {
  switch (action.type) {
    case this.actions.a1.actionType: {
      return (action as ActionsType0['a1']).payload;
    }
  }

  return state;
}

class Test0 extends RMCCtl<State, typeof actions0> {}

const test0 = createModule({ Ctl: Test0, ctlParams: [], reducer: rmcReducer0, actions: actions0 });

const actions1 = {
  ...actions0,
  a3: { proxy: test0.actions.a1 },
};

type ActionsType1 = ReducerActionsType<typeof actions1>;

function rmcReducer1(
  this: ReducerThisType<typeof Test0, typeof actions1>,
  state: State = { prop: true },
  action: ActionsType1[keyof ActionsType1],
  path: string
): State {
  switch (action.type) {
    case this.actions.a1.actionType: {
      return (action as ActionsType1['a3']).payload;
    }
  }

  return state;
}
