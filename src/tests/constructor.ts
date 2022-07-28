import { Action } from 'redux';

import { RMCCtl } from '../';

type State = {
  prop: string;
};

function rmcReducer(state: State = { prop: '' }, action: Action, path: string) {
  return state;
}
function regularReducer(state: State = { prop: '' }, action: Action) {
  return state;
}
const emptyActions = {};

// ### reducers ###

class Test2 extends RMCCtl<State, typeof emptyActions> {}

// it`s ok
new Test2(rmcReducer, emptyActions);
// it`s ok
new Test2(regularReducer, emptyActions);

// @ts-expect-error with not function reducer
new Test2({}, emptyActions);
// @ts-expect-error with not function reducer
new Test2(null, emptyActions);
// @ts-expect-error with not function reducer
new Test2('', emptyActions);
// @ts-expect-error with functional reducer with wrong types
new Test2((state: string = '', action: Action) => state, emptyActions);

// ### actions ###

const actions3 = {
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

class Test3 extends RMCCtl<State, typeof actions3> {}

// it`s ok
const test3 = new Test3(rmcReducer, actions3);

const actions3_1 = {
  ...actions3,
  a3: {
    proxy: test3.actions.a2,
  },
};

// it`s ok
class Test3_1 extends RMCCtl<State, typeof actions3_1> {}
const test3_1 = new Test3_1(rmcReducer, actions3_1);

// @ts-expect-error with action without a type
new Test3(rmcReducer, { a0: { creator: () => {} } });
// @ts-expect-error with action with wrong type
new Test3(rmcReducer, { a0: { creator: () => {}, type: null } });
// @ts-expect-error with action with wrong type
new Test3(rmcReducer, { a0: { creator: () => {}, type: true } });
// @ts-expect-error with action with wrong type
new Test3(rmcReducer, { a0: { creator: () => {}, type: {} } });

// @ts-expect-error with action with wrong proxy
new Test3(rmcReducer, { a0: { proxy: '' } });

// ### return type ###

class Test4 extends RMCCtl<State, typeof emptyActions> {
  method(): string {
    return '';
  }
}

const test4 = new Test4(regularReducer, emptyActions);

// it`s ok
test4.method();
