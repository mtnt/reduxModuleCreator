import { Action } from "redux";

import { RMCCtl, createModule } from "../";

type State = { prop: number }

function rmcReducer(state: State = { prop: 1 }, action: Action, path: string) {
  return state;
}

function regularReducer(state: State = { prop: 1 }, action: Action) {
  return state;
}

const emptyActions = {};

// ### controller WITH params ###

type State0 = { prop0: string; prop1: number };

class Test0 extends RMCCtl<State0, typeof emptyActions> {
  constructor(own: string, ...rest: ConstructorParameters<typeof RMCCtl<State0, typeof emptyActions>>) {
    super(...rest);
  }
}

class Test1 extends RMCCtl<State0, typeof emptyActions> {
}

function rmcReducer0(state: { prop0: string; prop1: number } = { prop0: "", prop1: 3 }, action: Action, path: string) {
  return state;
}

// it`s ok
createModule({ Ctl: Test0, ctlParams: ["own"], reducer: rmcReducer0, actions: emptyActions });

// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0, ctlParams: [], reducer: rmcReducer0, actions: emptyActions });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0, ctlParams: [true], reducer: rmcReducer0, actions: emptyActions });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0, ctlParams: [2, ""], reducer: rmcReducer0, actions: emptyActions });

// ### controller WITHOUT params ###

// it`s ok
createModule({ Ctl: Test1, ctlParams: [], reducer: rmcReducer0, actions: emptyActions });

// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test1, ctlParams: [""], reducer: rmcReducer0, actions: emptyActions });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test1, ctlParams: [true], reducer: rmcReducer0, actions: emptyActions });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test1, ctlParams: [2, ""], reducer: rmcReducer0, actions: emptyActions });

// ### reducers ###

class Test2 extends RMCCtl<State, typeof emptyActions> {
}

// income and outcome are not equal
function badReducer0(state: string | undefined, action: Action) {
  return true;
}

// equal income and outcome but its type is not appropriate the Test2s state type
function badReducer1(state: string | undefined = "", action: Action) {
  return state;
}

// it`s ok
createModule({ Ctl: Test2, ctlParams: [], reducer: rmcReducer, actions: emptyActions });
// it`s ok
createModule({ Ctl: Test2, ctlParams: [], reducer: regularReducer, actions: emptyActions });

// @ts-expect-error with not function reducer
createModule({ Ctl: Test2, ctlParams: [], reducer: {}, actions: emptyActions });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test2, ctlParams: [], reducer: null, actions: emptyActions });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test2, ctlParams: [], reducer: "", actions: emptyActions });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test2, ctlParams: [], reducer: badReducer0, actions: emptyActions });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test2, ctlParams: [], reducer: badReducer1, actions: emptyActions });

// ### actions ###

const actions3 = {
  a0: {
    type: "a0"
  },
  a1: {
    creator: () => ({}),
    type: 1
  },
  a2: {
    creator: (foo: string) => ({
      payload: {
        prop: foo
      }
    }),
    type: "a2"
  }
};

class Test3 extends RMCCtl<State, typeof actions3> {}

// it`s ok
const test3 = createModule({ Ctl: Test3, ctlParams: [], reducer: rmcReducer, actions: actions3 });

const actions3_1 = {
  ...actions3,
  a3: {
    proxy: test3.actions.a2,
  },
};

class Test3_1 extends RMCCtl<State, typeof actions3_1> {}
const test3_1 = new Test3_1(rmcReducer, actions3_1);

// it`s ok
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: actions3_1 });

// @ts-expect-error with action without a type
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: { a0: { creator: () => ({}) } } });
// @ts-expect-error with action with wrong type
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: { a0: { creator: () => ({}), type: null } } });
// @ts-expect-error with action with wrong type
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: { a0: { creator: () => ({}), type: true } } });
// @ts-expect-error with action with wrong type
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: { a0: { creator: () => ({}), type: {} } } });

// @ts-expect-error with action with wrong proxy
createModule({ Ctl: Test3_1, ctlParams: [], reducer: rmcReducer, actions: { a0: { proxy: "" } } });

createModule({
  Ctl: Test3_1,
  ctlParams: [],
  reducer: rmcReducer,
// @ts-expect-error with action with proxy and creator/type
  actions: { a0: { creator: () => ({}), type: "", proxy: test3.actions.a2 } }
});

// ### return type ###

class Test4 extends RMCCtl<State, typeof emptyActions> {
  method(): string {
    return "";
  }
}

const test4 = createModule({ Ctl: Test4, ctlParams: [], reducer: rmcReducer, actions: emptyActions });

// it`s ok
test4.method();

// @ts-expect-error
const f: boolean = test4.method();

// @ts-expect-error
test4.#ownState;
