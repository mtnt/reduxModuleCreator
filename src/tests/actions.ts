import { Action } from 'redux';

import { createModule, RMCCtl } from '../';

type State = {
  prop: string;
};

function rmcReducer(state: State = { prop: '' }, action: Action, path: string) {
  return state;
}

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

class Test0 extends RMCCtl<State, typeof actions0> {}

const test0 = createModule({ Ctl: Test0, ctlParams: [], reducer: rmcReducer, actions: actions0 });

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

// it`s ok
class Test0_1 extends RMCCtl<State, typeof actions1> {}

const test0_1 = createModule({ Ctl: Test0_1, ctlParams: [], reducer: rmcReducer, actions: actions1 });

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
