import { createModule, RMCCtl, type ReducerActionsType, ReducerThisType } from '../';

type State = {
  prop: string;
};

const actions0 = {
  a0: {
    type: 'a0',
  },
  a1: {
    creator: () => ({}),
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
  state: State = { prop: '' },
  action: ActionsType0[keyof ActionsType0],
  path: string
) {
  return state;
}

class Test0 extends RMCCtl<State, typeof actions0> {}

const test0 = createModule({ Ctl: Test0, ctlParams: [], reducer: rmcReducer0, actions: actions0 });

// it`s ok
test0.actions.a0();
test0.actions.a1();
test0.actions.a2('prm');

test0.a0();
test0.a1();
test0.a2('prm');

// @ts-expect-error if set param without creator
test0.actions.a0('');
// @ts-expect-error if set param without creator
test0.a0('');
// @ts-expect-error if param does not appropriate the creator (without params)
test0.actions.a1('');
// @ts-expect-error if param does not appropriate the creator (without params)
test0.a1('');
// @ts-expect-error if param does not appropriate the creator (with params)
test0.actions.a2(2);
// @ts-expect-error if param does not appropriate the creator (with params)
test0.a2(2);
// @ts-expect-error if param does not appropriate the creator (with params)
test0.actions.a2('2', '');
// @ts-expect-error if param does not appropriate the creator (with params)
test0.a2('2', '');

const actions1 = {
  ...actions0,
  a3: {
    proxy: test0.actions.a2,
  },
};

type ActionsType1 = ReducerActionsType<typeof actions1>;

function rmcReducer1(
  this: ReducerThisType<typeof Test0_1, typeof actions1>,
  state: State = { prop: '' },
  action: ActionsType1[keyof ActionsType1],
  path: string
) {
  return state;
}

// it`s ok
class Test0_1 extends RMCCtl<State, typeof actions1> {}

const test0_1 = createModule({ Ctl: Test0_1, ctlParams: [], reducer: rmcReducer1, actions: actions1 });

test0_1.actions.a3('proxy prm');
test0_1.a3('proxy prm');

// @ts-expect-error without expected param
test0_1.actions.a3();
// @ts-expect-error without expected param
test0_1.a3();
// @ts-expect-error with wrong param type
test0_1.actions.a3(2);
// @ts-expect-error with wrong param type
test0_1.a3(2);
// @ts-expect-error with wrong params amount
test0_1.actions.a3('2', true);
// @ts-expect-error with wrong params amount
test0_1.a3('2', true);
