import { createStore as createStoreRedux } from 'redux';

import { createStore, linkStore, unlinkStore, combineReducers, createModule, RMCCtl } from '../dist';

function createModule0(initialState) {
  class Ctl extends RMCCtl {
    get0() {
      return this.ownState._0;
    }

    get1() {
      return this.ownState._1;
    }

    action1(payload, prefix) {
      this.actions.action1(`${prefix}${payload}`);
    }

    stateDidUpdate() {}
  }

  const actions = {
    action0: {
      creator: payload => ({ payload }),
      type: 'action 0 type',
    },
    action1: {
      creator: payload => ({ payload }),
      type: 'action 1 type',
    },
  };

  function reducer0(state = initialState, action) {
    switch (action.type) {
      case this.actions.action0.actionType:
        return { ...state, _0: action.payload };

      case this.actions.action1.actionType:
        return { ...state, _1: action.payload };

      default:
        return state;
    }
  }

  return createModule({ Ctl, reducer: reducer0, actions });
}

const INITIAL_STATES = [undefined, {}, { initialProp: 'initialPropValue' }];
const GET_ROOT_REDUCER_METHODS = [
  modulesEntries =>
    combineReducers(modulesEntries.reduce((result, [path, module]) => ({ ...result, [path]: module }), {})),
];
const CREATE_STORE_METHODS = [
  (...args) => {
    return createStore(...args);
  },
  (...args) => {
    const store = createStoreRedux(...args);

    linkStore(store);

    return store;
  },
];

const combinations = INITIAL_STATES.reduce(
  (result, initialState, initialStateIdx) => [
    ...result,
    ...GET_ROOT_REDUCER_METHODS.reduce(
      (result, rootReducer, rootReducerIdx) => [
        ...result,
        ...CREATE_STORE_METHODS.map((createStore, createStoreIdx) => ({
          initialStateIdx,
          rootReducerIdx,
          createStoreIdx,
        })),
      ],
      []
    ),
  ],
  []
);

describe.each(combinations)('', ({ initialStateIdx, rootReducerIdx, createStoreIdx }) => {
  afterEach(() => {
    try {
      unlinkStore();
    } catch (e) {
      // if (!e.message.includes('Attempt to unlink not linked store')) {
      throw e;
      // }
    }
  });

  it(`state should be correct after a store creation (without a reducer for initial state): ${JSON.stringify({
    initialStateIdx,
    rootReducerIdx,
    createStoreIdx,
  })}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([[module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    expect(store.getState()).toEqual({
      [module0Path]: initialState,
    });
  });

  it(`state should be correct after a store creation (with a reducers for initial state): ${JSON.stringify({
    initialStateIdx,
    rootReducerIdx,
    createStoreIdx,
  })}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    const reducersForInitialState = Object.entries(initialState || {}).reduce((result, [key, state]) => {
      return [...result, [key, () => state]];
    }, []);
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([...reducersForInitialState, [module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    expect(store.getState()).toEqual({
      ...(initialState || {}),
      [module0Path]: initialState,
    });
  });

  it(`state should be correct after an action dispatched via '.actions': ${JSON.stringify({
    initialStateIdx,
    rootReducerIdx,
    createStoreIdx,
  })}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    // there is no reducers for initial state on the next line =>
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([[module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    const action0Payload = 'action 0 payload';
    module0.action0(action0Payload);

    expect(store.getState()).toEqual({
      [module0Path]: {
        ...initialState,
        _0: action0Payload,
      },
    });
  });

  it(`state should be correct after an action dispatched via custom method named the same with an action: ${JSON.stringify(
    {
      initialStateIdx,
      rootReducerIdx,
      createStoreIdx,
    }
  )}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    // there is no reducers for initial state on the next line =>
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([[module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    const action1Payload = 'action 1 payload';
    const action1Prefix = 'action 1 prefix';
    module0.action1(action1Payload, action1Prefix);

    expect(store.getState()).toEqual({
      [module0Path]: {
        ...initialState,
        _1: `${action1Prefix}${action1Payload}`,
      },
    });
  });

  it(`it is able to get data from the state via a getter: ${JSON.stringify({
    initialStateIdx,
    rootReducerIdx,
    createStoreIdx,
  })}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    // there is no reducers for initial state on the next line =>
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([[module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    const action1Payload = 'action 1 payload';
    const action1Prefix = 'action 1 prefix';
    module0.action1(action1Payload, action1Prefix);

    expect(module0.get1()).toBe(store.getState()[module0Path]._1);
  });

  it(`the stateDidUpdate should be called: ${JSON.stringify({
    initialStateIdx,
    rootReducerIdx,
    createStoreIdx,
  })}`, () => {
    const initialState = INITIAL_STATES[initialStateIdx];
    const module0 = createModule0(initialState);
    const module0Path = 'module0Path';
    // there is no reducers for initial state on the next line =>
    const rootReducer = GET_ROOT_REDUCER_METHODS[rootReducerIdx]([[module0Path, module0]]);
    const store = CREATE_STORE_METHODS[createStoreIdx](rootReducer, initialState);

    const spy = jest.spyOn(module0, 'stateDidUpdate');

    const action0Payload = 'action 0 payload';
    module0.action0(action0Payload);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(initialState);

    spy.mockClear();

    const action1Payload = 'action 1 payload';
    const action1Prefix = 'action 1 prefix';
    module0.action1(action1Payload, action1Prefix);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith({ ...initialState, _0: action0Payload });
  });
});
