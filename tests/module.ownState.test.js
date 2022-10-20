import cloneDeep from 'lodash.clonedeep';
import { createStore as reduxCreateStore } from 'redux';

import { unlinkStore, RMCCtl, createModule, combineReducers, createStore } from '../dist';

import { getActionCreator, creator, getUniquePath } from './helpers';

const VALID_CLASS = class SCtl extends RMCCtl {};
const ctlParams = [];
const MODULE_REDUCER = () => {
  return {
    name: 'initial',
  };
};

afterEach(() => {
  try {
    unlinkStore();
  } catch (e) {}
});

describe('module.ownState', () => {
  describe('for getting data', () => {
    it('should be accessible from outside', () => {
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const expected = cloneDeep(ownState);
      const reducer = (state = {}, action) => {
        return ownState;
      };
      const module = creator(VALID_CLASS, reducer);

      expect(module.ownState).toEqual(expected);
    });

    it('should be accessible from inside of controller`s method', () => {
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const expected = cloneDeep(ownState);
      const reducer = (state = {}, action) => {
        return ownState;
      };
      class Ctl extends VALID_CLASS {
        getOwnState() {
          return this.ownState;
        }
      }
      const module = creator(Ctl, reducer);

      expect(module.getOwnState()).toEqual(expected);
    });

    it('should be accessible from inside of controller`s arrow method', () => {
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const expected = cloneDeep(ownState);
      const reducer = (state = {}, action) => {
        return ownState;
      };
      class Ctl extends VALID_CLASS {
        getOwnState = () => {
          return this.ownState;
        };
      }
      const module = creator(Ctl, reducer);

      expect(module.getOwnState()).toEqual(expected);
    });

    it('should be accessible from inside of the `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      const someFunc = jest.fn();
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const expected = cloneDeep(ownState);
      function reducer(state = {}, action) {
        switch (action.type) {
          case actionCreator.actionType:
            return action.payload;

          default:
            return state;
        }
      }
      class Ctl extends VALID_CLASS {
        stateDidUpdate() {
          someFunc(this.ownState);
        }
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      store.dispatch(actionCreator(ownState));

      expect(someFunc).toHaveBeenCalledWith(expected);
    });

    it('should be accessible from inside of the arrow `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      const someFunc = jest.fn();
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const expected = cloneDeep(ownState);
      function reducer(state = {}, action) {
        switch (action.type) {
          case actionCreator.actionType:
            return action.payload;

          default:
            return state;
        }
      }
      class Ctl extends VALID_CLASS {
        stateDidUpdate = () => {
          someFunc(this.ownState);
        };
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      store.dispatch(actionCreator(ownState));

      expect(someFunc).toHaveBeenCalledWith(expected);
    });

    it('should be `undefined` unless the store get linked', () => {
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const reducer = (state = {}, action) => {
        return ownState;
      };
      const module = createModule({ Ctl: VALID_CLASS, ctlParams, reducer, actions: {} });
      const modulePath = getUniquePath();

      function rootReducer(state = {}, action) {
        return {
          [modulePath]: module.integrator(modulePath)(state[modulePath], action),
        };
      }

      reduxCreateStore(rootReducer);

      expect(module.ownState).toBe(undefined);
    });

    it('should be `undefined` while store is unlinked', () => {
      const ownState = {
        foo: 'bar',
        bar: 'foo',
      };
      const reducer = (state = {}, action) => {
        return ownState;
      };
      const module = creator(VALID_CLASS, reducer);

      unlinkStore();

      expect(module.ownState).toBe(undefined);
    });
  });

  describe('for setting whole state', () => {
    it('shouldn`t be accessible from outside', () => {
      const module = creator(VALID_CLASS, MODULE_REDUCER);

      expect(() => {
        module.ownState = {};
      }).toThrow();
    });

    it('shouldn`t be accessible from inside of controller`s method', () => {
      class Ctl extends VALID_CLASS {
        someMethod() {
          this.ownState = {};
        }
      }
      const module = creator(Ctl, MODULE_REDUCER);

      expect(() => {
        module.someMethod();
      }).toThrow();
    });

    it('shouldn`t be accessible from inside of controller`s arrow method', () => {
      class Ctl extends VALID_CLASS {
        someMethod = () => {
          this.ownState = {};
        };
      }
      const module = creator(Ctl, MODULE_REDUCER);

      expect(() => {
        module.someMethod();
      }).toThrow();
    });

    it('shouldn`t be accessible from inside of the `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      function reducer(state = {}, action) {
        switch (action.type) {
          case actionCreator.actionType:
            return action.payload;

          default:
            return state;
        }
      }
      class Ctl extends VALID_CLASS {
        stateDidUpdate() {
          this.ownState = {};
        }
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      expect(() => {
        store.dispatch(actionCreator());
      }).toThrow();
    });

    it('shouldn`t be accessible from inside of the arrow `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      function reducer(state = {}, action) {
        switch (action.type) {
          case actionCreator.actionType:
            return action.payload;

          default:
            return state;
        }
      }
      class Ctl extends VALID_CLASS {
        stateDidUpdate = () => {
          this.ownState = {};
        };
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      expect(() => {
        store.dispatch(actionCreator());
      }).toThrow();
    });
  });

  // there is undesirable behavior tested below
  describe('for setting a part of the state', () => {
    it('should be accessible from outside', () => {
      const ownState = {
        foo: {
          bar: 'foo',
        },
      };
      const nextFoo = 'nextFoo';
      const expected = {
        foo: nextFoo,
      };
      function reducer(state = {}, action) {
        return ownState;
      }
      const module = creator(VALID_CLASS, reducer);

      module.ownState.foo = nextFoo;

      expect(module.ownState).toEqual(expected);
    });

    it('should be accessible from inside of controller`s method', () => {
      const ownState = {
        foo: {
          bar: 'foo',
        },
      };
      const nextFoo = 'nextFoo';
      const expected = {
        foo: nextFoo,
      };
      function reducer(state = {}, action) {
        return ownState;
      }
      class Ctl extends VALID_CLASS {
        someMethod() {
          this.ownState.foo = nextFoo;
        }
      }
      const module = creator(Ctl, reducer);

      module.someMethod();

      expect(module.ownState).toEqual(expected);
    });

    it('should be accessible from inside of controller`s arrow method', () => {
      const ownState = {
        foo: {
          bar: 'foo',
        },
      };
      const nextFoo = 'nextFoo';
      const expected = {
        foo: nextFoo,
      };
      function reducer(state = {}, action) {
        return ownState;
      }
      class Ctl extends VALID_CLASS {
        someMethod = () => {
          this.ownState.foo = nextFoo;
        };
      }
      const module = creator(Ctl, reducer);

      module.someMethod();

      expect(module.ownState).toEqual(expected);
    });

    it('should be accessible from inside of the `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      const initialState = {
        foo: {
          bar: 'foo',
        },
      };
      const actionFoo = {};
      const manualFoo = 'nextFoo';
      const expected = {
        foo: manualFoo,
      };
      function reducer(state = initialState, action) {
        switch (action.type) {
          case actionCreator.actionType: {
            return {
              ...state,
              foo: action.payload,
            };
          }

          default:
            return state;
        }
      }
      const fn = jest.fn();
      class Ctl extends VALID_CLASS {
        stateDidUpdate() {
          fn();

          expect(this.ownState.foo).toEqual(actionFoo);

          this.ownState.foo = manualFoo;
        }
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      store.dispatch(actionCreator(actionFoo));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(module.ownState).toEqual(expected);
    });

    it('should be accessible from inside of the arrow `stateDidUpdate` method', () => {
      const actionCreator = getActionCreator();
      const initialState = {
        foo: {
          bar: 'foo',
        },
      };
      const actionFoo = {};
      const manualFoo = 'nextFoo';
      const expected = {
        foo: manualFoo,
      };
      function reducer(state = initialState, action) {
        switch (action.type) {
          case actionCreator.actionType: {
            return {
              ...state,
              foo: action.payload,
            };
          }

          default:
            return state;
        }
      }
      const fn = jest.fn();
      class Ctl extends VALID_CLASS {
        stateDidUpdate = () => {
          fn();

          expect(this.ownState.foo).toEqual(actionFoo);

          this.ownState.foo = manualFoo;
        };
      }
      const module = createModule({ Ctl, ctlParams, reducer, actions: {} });
      const rootReducer = combineReducers({ [getUniquePath()]: module });

      const store = createStore(rootReducer);

      store.dispatch(actionCreator(actionFoo));

      expect(fn).toHaveBeenCalledTimes(1);
      expect(module.ownState).toEqual(expected);
    });
  });
});
