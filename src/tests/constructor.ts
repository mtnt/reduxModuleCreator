import { RMCCtl, type ReducerActionsType, type ReducerThisType } from '../';

// ### reducers ###

type State0 = { prop: string };

const actions0 = {
  test: {
    creator: () => ({ payload: 1 }),
    type: 'test',
  },
};
type ActionsType0 = ReducerActionsType<typeof actions0>;

class Test0 extends RMCCtl<State0, typeof actions0> {}

function rmcReducer0(
  this: ReducerThisType<typeof Test0, typeof actions0>,
  state: State0 = { prop: '' },
  action: ActionsType0[keyof ActionsType0],
  path: string
) {
  return state;
}
function regularReducer0(
  this: ReducerThisType<typeof Test0, typeof actions0>,
  state: State0 = { prop: '' },
  action: ActionsType0[keyof ActionsType0]
) {
  return state;
}

// it`s ok
new Test0(rmcReducer0, actions0);
// it`s ok
new Test0(regularReducer0, actions0);

// @ts-expect-error with not function reducer
new Test0({}, actions0);
// @ts-expect-error with not function reducer
new Test0(null, actions0);
// @ts-expect-error with not function reducer
new Test0('', actions0);
// @ts-expect-error with functional reducer with wrong types
new Test0((state: string = '', action: Action) => state, actions0);

// ### actions ###

type State1 = { prop: string };

// ### ok with action without a type

const actions1_0 = {
  a0: {
    creator: () => ({}),
  },
};
type ActionsType1_0 = ReducerActionsType<typeof actions1_0>;

class Test1_0 extends RMCCtl<State1, typeof actions1_0> {}

function rmcReducer1_0(
  this: ReducerThisType<typeof Test1_0, typeof actions1_0>,
  state: State0 = { prop: '' },
  action: ActionsType1_0[keyof ActionsType1_0],
  path: string
) {
  return state;
}

const test1_0 = new Test1_0(rmcReducer1_0, actions1_0);

// ### ok with action without a creator

const actions1_1 = {
  a0: {
    type: '',
  },
};
type ActionsType1_1 = ReducerActionsType<typeof actions1_1>;

class Test1_1 extends RMCCtl<State1, typeof actions1_1> {}

function rmcReducer1_1(
  this: ReducerThisType<typeof Test1_1, typeof actions1_1>,
  state: State0 = { prop: '' },
  action: ActionsType1_1[keyof ActionsType1_1],
  path: string
) {
  return state;
}

const test1_1 = new Test1_1(rmcReducer1_1, actions1_1);

// ### ok with action without both a type and a creator

const actions1_2 = {
  a0: {},
};
type ActionsType1_2 = ReducerActionsType<typeof actions1_2>;

class Test1_2 extends RMCCtl<State1, typeof actions1_2> {}

function rmcReducer1_2(
  this: ReducerThisType<typeof Test1_2, typeof actions1_2>,
  state: State0 = { prop: '' },
  action: ActionsType1_2[keyof ActionsType1_2],
  path: string
) {
  return state;
}

const test1_2 = new Test1_2(rmcReducer1_2, actions1_2);

// ### ok with action with both a type and a creator

const actions1_3 = {
  a0: {
    creator: () => ({}),
    type: '',
  },
};
type ActionsType1_3 = ReducerActionsType<typeof actions1_3>;

class Test1_3 extends RMCCtl<State1, typeof actions1_3> {}

function rmcReducer1_3(
  this: ReducerThisType<typeof Test1_3, typeof actions1_3>,
  state: State0 = { prop: '' },
  action: ActionsType1_3[keyof ActionsType1_3],
  path: string
) {
  return state;
}

const test1_3 = new Test1_3(rmcReducer1_3, actions1_3);

// ### ok if creator returns not empty object

const actions1_4 = {
  a0: {
    creator: () => ({ payload: {} }),
    type: '',
  },
};
type ActionsType1_4 = ReducerActionsType<typeof actions1_4>;

class Test1_4 extends RMCCtl<State1, typeof actions1_4> {}

function rmcReducer1_4(
  this: ReducerThisType<typeof Test1_4, typeof actions1_4>,
  state: State0 = { prop: '' },
  action: ActionsType1_4[keyof ActionsType1_4],
  path: string
) {
  return state;
}

const test1_4 = new Test1_4(rmcReducer1_4, actions1_4);

// ### not ok if a type is wrong

const actions1_5 = {
  a0: {
    creator: () => ({ payload: {} }),
    type: true,
  },
};
// @ts-expect-error
type ActionsType1_5 = ReducerActionsType<typeof actions1_5>;
// @ts-expect-error
class Test1_5 extends RMCCtl<State1, typeof actions1_5> {}

function rmcReducer1_5(
  // @ts-expect-error
  this: ReducerThisType<typeof Test1_5, typeof actions1_5>,
  state: State0 = { prop: '' },
  action: ActionsType1_5[keyof ActionsType1_5],
  path: string
) {
  return state;
}
// @ts-expect-error
const test1_5 = new Test1_4(rmcReducer1_5, actions1_5);

// ### not ok if a proxy is wrong

const actions1_6 = {
  a0: {
    proxy: true,
  },
};
// @ts-expect-error
type ActionsType1_6 = ReducerActionsType<typeof actions1_6>;
// @ts-expect-error
class Test1_6 extends RMCCtl<State1, typeof actions1_6> {}

function rmcReducer1_6(
  // @ts-expect-error
  this: ReducerThisType<typeof Test1_6, typeof actions1_6>,
  state: State0 = { prop: '' },
  action: ActionsType1_6[keyof ActionsType1_6],
  path: string
) {
  return state;
}
// @ts-expect-error
const test1_6 = new Test1_4(rmcReducer1_6, actions1_6);

// ### return type ###

type State2 = { prop: string };

const actions2 = {
  a0: {
    creator: () => ({}),
    type: '',
  },
};
type ActionsType2 = ReducerActionsType<typeof actions2>;

class Test2 extends RMCCtl<State2, typeof actions2> {
  method(): string {
    return '';
  }
}

function rmcReducer2(
  this: ReducerThisType<typeof Test2, typeof actions2>,
  state: State0 = { prop: '' },
  action: ActionsType2[keyof ActionsType2],
  path: string
) {
  return state;
}

const test4 = new Test2(rmcReducer2, actions2);

// it`s ok
test4.method();
