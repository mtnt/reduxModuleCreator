import { Action } from 'redux';

import { RMCCtl, createModule, combineReducers, type ReducerThisType, type ReducerActionsType } from '../';

const actions = {
  test: {
    creator: () => ({}),
    type: 'test',
  },
};
type ActionsType = ReducerActionsType<typeof actions>;

type StateRMC = { prop0: string; prop1: number };
type StateRegular = { prop0: boolean; prop1: string };

class TestRMC extends RMCCtl<StateRMC, typeof actions> {}
class TestRegular extends RMCCtl<StateRegular, typeof actions> {}

function rmcReducer(
  this: ReducerThisType<typeof TestRMC, typeof actions>,
  state: StateRMC = { prop0: '', prop1: 3 },
  action: ActionsType[keyof ActionsType],
  path: string
) {
  return state;
}
function regularReducer(
  this: ReducerThisType<typeof TestRegular, typeof actions>,
  state: StateRegular = { prop0: true, prop1: '' },
  action: ActionsType[keyof ActionsType]
) {
  return state;
}

const testMdl0 = createModule({
  Ctl: TestRMC,
  ctlParams: [],
  reducer: rmcReducer,
  actions,
});
const testMdl1 = createModule({
  Ctl: TestRegular,
  ctlParams: [],
  reducer: regularReducer,
  actions,
});
const stateReducerMap = {
  foo0: rmcReducer,
  foo0_1: testMdl0,
  foo1: regularReducer,
  foo1_1: testMdl1,
};

// it`s ok
combineReducers(stateReducerMap);

// ### reducers ###

// @ts-expect-error with wrong reducer
combineReducers({ foo0: '' });
// @ts-expect-error with wrong reducer
combineReducers({ foo0: null });
// @ts-expect-error with wrong reducer
combineReducers({ foo0: {} });
// @ts-expect-error with wrong reducer
combineReducers({ foo0: (data, action: string) => data });
// @ts-expect-error with wrong reducer
combineReducers({ foo0: (data, action: Action, some: boolean) => data });
// @ts-expect-error with wrong reducer
combineReducers({ foo0: (data: boolean | undefined, action: Action) => 'data' });

// ### return type ###

const state = {
  foo0: { prop0: '', prop1: 1 },
  foo0_1: { prop0: '', prop1: 1 },
  foo1: { prop0: true, prop1: '1' },
  foo1_1: { prop0: true, prop1: '1' },
};

// it`s ok
const rootReducerOk = combineReducers(stateReducerMap);

// @ts-expect-error if return type is not expected
const rootReducer0: {
  foo0: { prop0: string; prop1: boolean };
  foo0_1: { prop0: string; prop1: number };
  foo1: { prop0: boolean; prop1: string };
  foo1_1: { prop0: boolean; prop1: string };
} = combineReducers(stateReducerMap)(state, { type: '' });
// @ts-expect-error if return type is not expected
const rootReducer1: {
  foo0: string;
  foo0_1: { prop0: string; prop1: number };
  foo1: { prop0: boolean; prop1: string };
  foo1_1: { prop0: boolean; prop1: string };
} = combineReducers(stateReducerMap)(state, { type: '' });
