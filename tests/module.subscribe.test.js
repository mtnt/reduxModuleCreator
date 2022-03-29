import { allValuesTypes, testAllValues } from 'unit-tests-values-iterators';

import { linkStore, unlinkStore, createStore, RMCCtl, createModule, combineReducers } from '../src';
import { getActionCreator, creator, getUniquePath } from './helpers';
import { InvalidParamsError } from '../src/lib/baseErrors';

const payload0 = {
  name: 'payload0',
  value: true,
};
const payload1 = {
  name: 'payload1',
  value: false,
};
const initialData = {
  name: 'initial',
};

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return initialData;
};

afterEach(() => {
  try {
    unlinkStore();
  } catch (e) {}
});

describe('module.subscribe', () => {
  testAllValues(
    (listener, type) => {
      it(`should throw an error if get none function argument: ${listener} of type ${type}`, () => {
        const module = creator(VALID_CLASS, MODULE_REDUCER);

        expect(() => {
          module.subscribe(listener);
        }).toThrow(InvalidParamsError);
      });
    },
    { exclude: [allValuesTypes.FUNCTION] }
  );

  it('should be able to get called several times with different listeners', () => {
    const module = creator(VALID_CLASS, MODULE_REDUCER);

    expect(() => {
      module.subscribe(function() {});
      module.subscribe(function() {});
    }).not.toThrow();
  });

  it('should be able to get called several times with same listener', () => {
    const module = creator(VALID_CLASS, MODULE_REDUCER);
    const listener = function() {};

    expect(() => {
      module.subscribe(listener);
      module.subscribe(listener);
    }).not.toThrow();
  });

  it('should call listener single time when state get changed once', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }

    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);
    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should call listener single time even it was added twice', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);
    module.subscribe(listener);
    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should call each listener', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);
    const listener0 = jest.fn();
    const listener1 = jest.fn();

    module.subscribe(listener0);
    module.subscribe(listener1);
    store.dispatch(actionCreator(payload0));

    expect(listener0).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  it('should call listener with prev and new state arguments', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);
    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledWith(initialData, payload0);
  });

  it('should return function unsubscriber', () => {
    const module = creator(VALID_CLASS, MODULE_REDUCER);

    const unsubscriber = module.subscribe(function() {});

    expect(unsubscriber).toEqual(expect.any(Function));
  });

  it('should not call listener after unsubscribe', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);
    const listener = jest.fn();
    const unsubscriber = module.subscribe(listener);

    unsubscriber();
    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should not call listener after unlink store', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const modulePath = getUniquePath();
    function rootReducer(state = {}, action) {
      return {
        [modulePath]: module.integrator(modulePath)(state[modulePath], action),
      };
    }
    const store = createStore(rootReducer);
    const listener = jest.fn();
    module.subscribe(listener);

    unlinkStore();

    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should keep subscription even after relink store', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const modulePath = getUniquePath();

    function rootReducer(state = {}, action) {
      return {
        [modulePath]: module.integrator(modulePath)(state[modulePath], action),
      };
    }

    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);

    unlinkStore();
    linkStore(store);

    store.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not call listener if state is not actually changed', () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule({ Ctl: VALID_CLASS, reducer, actions: {} });
    const modulePath = getUniquePath();

    function rootReducer(state = {}, action) {
      return {
        [modulePath]: module.integrator(modulePath)(state[modulePath], action),
      };
    }

    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);

    store.dispatch(actionCreator(initialData));

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('actions does not affects module after unlink store', () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    class Ctl extends RMCCtl {
      _stateDidUpdate(...args) {
        stateDidUpdate(...args);
      }
    }
    const module = createModule({ Ctl, reducer, actions: {} });
    const modulePath = getUniquePath();
    function rootReducer(state = {}, action) {
      return {
        [modulePath]: module.integrator(modulePath)(state[modulePath], action),
      };
    }
    const store = createStore(rootReducer);

    unlinkStore();
    store.dispatch(actionCreator(payload0));

    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });
});
