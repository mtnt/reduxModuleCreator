import { createStore, combineReducers, type ReducerActionsType, type ReducerThisType } from '../';

type State = {
  prop0: string;
  prop1: number;
};

const actions0 = {
  a: {
    creator: () => ({}),
    type: 1,
  },
};

type ActionsType0 = ReducerActionsType<typeof actions0>;

function rmcReducer0(
  this: ReducerThisType<State, typeof actions0>,
  state: State = { prop0: '', prop1: 1 },
  action: ActionsType0[keyof ActionsType0],
  path: string
) {
  return state;
}

const rootReducer = combineReducers({
  foo: rmcReducer0,
});

// @ts-expect-error: wrong enhancer/preloadedState
createStore(rootReducer, []);
// @ts-expect-error: wrong enhancer/preloadedState
createStore(rootReducer, '');
// @ts-expect-error: wrong enhancer
createStore(rootReducer, undefined, []);
// @ts-expect-error: wrong enhancer
createStore(rootReducer, {}, {});
