import { RMCCtl, createModule, type ReducerActionsType, type ReducerThisType } from "../";

// ### controller WITH params ###

const actions0 = {
  test: {
    creator: () => ({ payload: 1 }),
    type: 'test'
  }
}
type ActionsType0 = ReducerActionsType<typeof actions0>;

type State0 = { prop0: string; prop1: number };

class Test0_0 extends RMCCtl<State0, typeof actions0> {
  constructor(own: string, ...rest: ConstructorParameters<typeof RMCCtl<State0, typeof actions0>>) {
    super(...rest);
  }
}

class Test0_1 extends RMCCtl<State0, typeof actions0> {}

function rmcReducer0(
  this: ReducerThisType<typeof Test0_1, typeof actions0>,
  state: State0 = { prop0: "", prop1: 3 },
  action: ActionsType0[keyof ActionsType0],
  path: string
) {
  return state;
}

// it`s ok
createModule({ Ctl: Test0_0, ctlParams: ["own"], reducer: rmcReducer0, actions: actions0 });

// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_0, ctlParams: [], reducer: rmcReducer0, actions: actions0 });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_0, ctlParams: [true], reducer: rmcReducer0, actions: actions0 });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_0, ctlParams: [2, ""], reducer: rmcReducer0, actions: actions0 });

// ### controller WITHOUT params ###

// it`s ok
createModule({ Ctl: Test0_1, ctlParams: [], reducer: rmcReducer0, actions: actions0 });

// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_1, ctlParams: [""], reducer: rmcReducer0, actions: actions0 });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_1, ctlParams: [true], reducer: rmcReducer0, actions: actions0 });
// @ts-expect-error if ctlParams do not appropriate the controller
createModule({ Ctl: Test0_1, ctlParams: [2, ""], reducer: rmcReducer0, actions: actions0 });

// ### reducers ###

const actions1 = {
  test: {
    creator: () => ({ payload: 1 }),
  }
}
type ActionsType1 = ReducerActionsType<typeof actions1>;

type State1 = { prop: number }

class Test1 extends RMCCtl<State1, typeof actions1> {}

function rmcReducer1(
  this: ReducerThisType<typeof Test1, typeof actions1>,
  state: State1 = { prop: 1 },
  action: ActionsType1[keyof ActionsType1],
  path: string
) {
  return state;
}

function regularReducer1(
  this: ReducerThisType<typeof Test1, typeof actions1>,
  state: State1 = { prop: 1 },
  action: ActionsType1[keyof ActionsType1]
) {
  return state;
}

// income and outcome are not equal
function badReducer0(this: ReducerThisType<typeof Test1, typeof actions1>, state: string | undefined, action: ActionsType1[keyof ActionsType1]) {
  return true;
}

// equal income and outcome but its type is not appropriate the Test1s state type
function badReducer1(this: ReducerThisType<typeof Test1, typeof actions1>, state: string | undefined = "", action: ActionsType1[keyof ActionsType1]) {
  return state;
}

// it`s ok
createModule({ Ctl: Test1, ctlParams: [], reducer: rmcReducer1, actions: actions1 });
// it`s ok
createModule({ Ctl: Test1, ctlParams: [], reducer: regularReducer1, actions: actions1 });

// @ts-expect-error with not function reducer
createModule({ Ctl: Test1, ctlParams: [], reducer: {}, actions: actions1 });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test1, ctlParams: [], reducer: null, actions: actions1 });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test1, ctlParams: [], reducer: "", actions: actions1 });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test1, ctlParams: [], reducer: badReducer0, actions: actions1 });
// @ts-expect-error with not function reducer
createModule({ Ctl: Test1, ctlParams: [], reducer: badReducer1, actions: actions1 });

// ### actions ###

type State2 = { prop: number }

// ### ok if action has no type

const actions2_0 = {
  a0: {
    creator: () => ({}),
  },
};
type ActionsType2_0 = ReducerActionsType<typeof actions2_0>;

class Test2_0 extends RMCCtl<State2, typeof actions2_0> {}

function regularReducer2_0(
  this: ReducerThisType<typeof Test2_0, typeof actions2_0>,
  state: State2 = { prop: 1 },
  action: ActionsType2_0[keyof ActionsType2_0],
  path: string
) {
  return state;
}

const test2_0 = createModule({ Ctl: Test2_0, ctlParams: [], reducer: regularReducer2_0, actions: actions2_0 });

// ### ok if action has no creator

const actions2_1 = {
  a0: {
    type: ''
  },
};
type ActionsType2_1 = ReducerActionsType<typeof actions2_1>;

class Test2_1 extends RMCCtl<State2, typeof actions2_1> {}

function regularReducer2_1(
  this: ReducerThisType<typeof Test2_1, typeof actions2_1>,
  state: State2 = { prop: 1 },
  action: ActionsType2_1[keyof ActionsType2_1],
  path: string
) {
  return state;
}

const test2_1 = createModule({ Ctl: Test2_1, ctlParams: [], reducer: regularReducer2_1, actions: actions2_1 });

// ### ok if action has no both creator and type

const actions2_2 = {
  a0: {},
};
type ActionsType2_2 = ReducerActionsType<typeof actions2_2>;

class Test2_2 extends RMCCtl<State2, typeof actions2_2> {}

function regularReducer2_2(
  this: ReducerThisType<typeof Test2_2, typeof actions2_2>,
  state: State2 = { prop: 1 },
  action: ActionsType2_2[keyof ActionsType2_2],
  path: string
) {
  return state;
}

const test2_2 = createModule({ Ctl: Test2_2, ctlParams: [], reducer: regularReducer2_2, actions: actions2_2 });

// ### ok if action has both creator and type

const actions2_3 = {
  a0: {
    creator: () => ({}),
    type: ''
  },
};
type ActionsType2_3 = ReducerActionsType<typeof actions2_3>;

class Test2_3 extends RMCCtl<State2, typeof actions2_3> {}

function regularReducer2_3(
  this: ReducerThisType<typeof Test2_3, typeof actions2_3>,
  state: State2 = { prop: 1 },
  action: ActionsType2_3[keyof ActionsType2_3],
  path: string
) {
  return state;
}

const test2_3 = createModule({ Ctl: Test2_3, ctlParams: [], reducer: regularReducer2_3, actions: actions2_3 });

// ### ok if creator returns filled object

const actions2_4 = {
  a0: {
    creator: () => ({ payload: 2 }),
  },
};
type ActionsType2_4 = ReducerActionsType<typeof actions2_4>;

class Test2_4 extends RMCCtl<State2, typeof actions2_4> {}

function regularReducer2_4(
  this: ReducerThisType<typeof Test2_4, typeof actions2_4>,
  state: State2 = { prop: 1 },
  action: ActionsType2_4[keyof ActionsType2_4],
  path: string
) {
  return state;
}

const test2_4 = createModule({ Ctl: Test2_4, ctlParams: [], reducer: regularReducer2_4, actions: actions2_4 });

// ### not ok if type is wrong

const actions2_5 = {
  a0: {
    creator: () => ({ payload: 2 }),
    type: null
  },
};
// @ts-expect-error
type ActionsType2_5 = ReducerActionsType<typeof actions2_5>;
// @ts-expect-error
class Test2_5 extends RMCCtl<State2, typeof actions2_5> {}

function regularReducer2_5(
  // @ts-expect-error
  this: ReducerThisType<typeof Test2_5, typeof actions2_5>,
  state: State2 = { prop: 1 },
  action: ActionsType2_5[keyof ActionsType2_5],
  path: string
) {
  return state;
}
// @ts-expect-error
const test2_5 = createModule({ Ctl: Test2_5, ctlParams: [], reducer: regularReducer2_5, actions: actions2_5 });

// ### not ok if proxy is wrong

const actions2_6 = {
  a0: {
    proxy: ""
  },
};
// @ts-expect-error
type ActionsType2_6 = ReducerActionsType<typeof actions2_6>;
// @ts-expect-error
class Test2_6 extends RMCCtl<State2, typeof actions2_6> {}

function regularReducer2_6(
  // @ts-expect-error
  this: ReducerThisType<typeof Test2_6, typeof actions2_6>,
  state: State2 = { prop: 1 },
  action: ActionsType2_6[keyof ActionsType2_6],
  path: string
) {
  return state;
}
// @ts-expect-error
const test2_6 = createModule({ Ctl: Test2_6, ctlParams: [], reducer: regularReducer2_6, actions: actions2_6 });

// ### return type ###

type State3 = { prop: number }

const actions3 = {
  a0: {
    creator: () => ({}),
  },
};
type ActionsType3 = ReducerActionsType<typeof actions3>;

function regularReducer3(
  this: ReducerThisType<typeof Test3, typeof actions3>,
  state: State3 = { prop: 1 },
  action: ActionsType3[keyof ActionsType3],
  path: string
) {
  return state;
}

class Test3 extends RMCCtl<State3, typeof actions3> {
  method(): string {
    return "";
  }
}

const test4 = createModule({ Ctl: Test3, ctlParams: [], reducer: regularReducer3, actions: actions3 });

// it`s ok
test4.method();

// @ts-expect-error
const f: boolean = test4.method();

// @ts-expect-error
test4.#ownState;
