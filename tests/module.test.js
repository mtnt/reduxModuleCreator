import { unlinkStore, RMCCtl, createModule, combineReducers, createStore } from '../dist';
import { getActionCreator, creator, getUniquePath } from './helpers';

const VALID_CLASS = class SCtl extends RMCCtl {};
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

describe('module', () => {
  it('should have access to the controller`s methods and properties directly from the module', () => {
    class Ctl extends VALID_CLASS {
      getter0() {
        return 0;
      }

      setter1(value) {
        this.value = value;
      }

      getter1 = () => {
        return this.value;
      };

      setter2 = value => {
        this.value = value;
      };
    }

    const module = creator(Ctl, MODULE_REDUCER);

    expect(module.getter0()).toBe(0);

    module.setter1(1);
    expect(module.getter1()).toBe(1);

    module.value = 2;
    expect(module.getter1()).toBe(2);

    module.setter2(3);
    expect(module.getter1()).toBe(3);
  });

  // it('should have access to controller`s protected method from inside another controller`s methods', () => {
  //   const someFunc0 = jest.fn();
  //   const someFunc1 = jest.fn();
  //
  //   class Ctl extends VALID_CLASS {
  //     someMethod() {
  //       this._protectedMethod0();
  //     }
  //
  //     arrowMethod = () => {
  //       this._protectedMethod1();
  //     };
  //
  //     _protectedMethod0() {
  //       someFunc0();
  //     }
  //
  //     _protectedMethod1() {
  //       someFunc1();
  //     }
  //   }
  //   const module = creator(Ctl, MODULE_REDUCER);
  //
  //   module.someMethod();
  //   module.arrowMethod();
  //
  //   expect(someFunc0).toHaveBeenCalledTimes(1);
  //   expect(someFunc1).toHaveBeenCalledTimes(1);
  // });

  it("should have access to parent`s method using 'super'", () => {
    const actionCreator = getActionCreator();
    function reducer(state = 'initial', action) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    const someFunc0 = jest.fn();
    const someFunc1 = jest.fn();
    const listener0 = jest.fn();
    const listener1 = jest.fn();
    class Ctl extends VALID_CLASS {
      subscribe(listener) {
        someFunc0();

        super.subscribe(listener);
      }

      arrowSubscribe(listener) {
        someFunc1();

        super.subscribe(listener);
      }
    }
    const module = createModule({ Ctl, reducer, actions: {} });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    const store = createStore(rootReducer);

    module.subscribe(listener0);
    module.arrowSubscribe(listener1);

    expect(someFunc0).toHaveBeenCalledTimes(1);
    expect(someFunc1).toHaveBeenCalledTimes(1);

    store.dispatch(actionCreator('payload'));

    expect(listener0).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  it('should have access to actions from the controller methods', () => {
    const payload = 'foo';
    class Ctl extends RMCCtl {
      method0() {
        this.actions.action0(payload);
      }
    }
    const spy = jest.fn();
    const module = createModule({
      Ctl,
      reducer: MODULE_REDUCER,
      actions: {
        action0: {
          creator: payload => {
            spy(payload);

            return { payload };
          },
          type: 'sampleAction',
        },
      },
    });
    const rootReducer = combineReducers({ [getUniquePath()]: module });
    createStore(rootReducer);

    module.method0();

    expect(spy).toHaveBeenCalledWith(payload);
  });

  it('should call controllers method `didLinkedWithStore` on get linked', () => {
    const testFunc = jest.fn();
    class Ctl extends VALID_CLASS {
      didLinkedWithStore() {
        testFunc();
      }
    }

    creator(Ctl, MODULE_REDUCER);

    expect(testFunc).toHaveBeenCalledTimes(1);
  });

  it('should call controllers method `didUnlinkedWithStore` on get unlinked', () => {
    const testFunc = jest.fn();
    class Ctl extends VALID_CLASS {
      didUnlinkedWithStore() {
        testFunc();
      }
    }

    creator(Ctl, MODULE_REDUCER);

    unlinkStore();

    expect(testFunc).toHaveBeenCalledTimes(1);
  });

  it('should contain methods equally named with actions in the `actions` property', () => {
    const actionCreator0 = getActionCreator();
    const actionCreator1 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { creator: actionCreator0, type: actionCreator0.actionType },
        action1: { creator: actionCreator1, type: actionCreator1.actionType },
      },
    });

    expect(module.actions.action0).toEqual(expect.any(Function));
    expect(module.actions.action1).toEqual(expect.any(Function));
  });

  it('should contain methods equally named with actions in the root', () => {
    const actionCreator0 = getActionCreator();
    const actionCreator1 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { creator: actionCreator0, type: actionCreator0.actionType },
        action1: { creator: actionCreator1, type: actionCreator1.actionType },
      },
    });

    expect(module.action0).toEqual(expect.any(Function));
    expect(module.action1).toEqual(expect.any(Function));
  });

  it('should contain methods equally named with proxied actions in the `actions` property', () => {
    const actionCreator0 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { proxy: actionCreator0 },
      },
    });

    expect(module.actions.action0).toEqual(expect.any(Function));
  });

  it('should contain methods the same with proxied actions in the `actions` property', () => {
    const actionCreator0 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { proxy: actionCreator0 },
      },
    });

    expect(module.actions.action0).toBe(actionCreator0);
  });

  it('should contain methods equally named with proxied actions in the root', () => {
    const actionCreator0 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { proxy: actionCreator0 },
      },
    });

    expect(module.action0).toEqual(expect.any(Function));
  });

  it('should contain methods with same actionType as proxied actions in the root', () => {
    // can`t check equality coz root methods must be bounded to an instance

    const actionCreator0 = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action0: { proxy: actionCreator0 },
      },
    });

    expect(module.action0.actionType).toEqual(actionCreator0.actionType);
  });

  it('should use controller`s method if it`s name is equal with an action`s one', () => {
    const actionCreator0 = getActionCreator();

    const method = jest.fn();
    class SCtl extends RMCCtl {
      methodName() {
        method();
      }
    }

    const module = createModule({
      Ctl: SCtl,
      reducer: MODULE_REDUCER,
      actions: {
        methodName: { creator: actionCreator0, type: actionCreator0.actionType },
      },
    });

    module.methodName();

    expect(method).toHaveBeenCalled();
  });

  it('should contain actions with types based but not equal with specified', () => {
    const actionCreator = getActionCreator();

    const module = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action: { creator: actionCreator, type: actionCreator.actionType },
      },
    });

    expect(module.actions.action.actionType).not.toEqual(actionCreator.actionType);
    expect(module.actions.action.actionType).toContain(actionCreator.actionType);
  });

  it('should contain actions with types different in instances', () => {
    const actionCreator = getActionCreator();

    const module0 = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action: { creator: actionCreator, type: actionCreator.actionType },
      },
    });
    const module1 = createModule({
      Ctl: VALID_CLASS,
      reducer: MODULE_REDUCER,
      actions: {
        action: { creator: actionCreator, type: actionCreator.actionType },
      },
    });

    expect(module0.actions.action.actionType).not.toEqual(module1.actions.action.actionType);
  });
});
