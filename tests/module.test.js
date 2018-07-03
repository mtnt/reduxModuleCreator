import {noop} from "lodash";

import {unlinkStore, RMCCtl, createModule, combineReducers, createStore} from "../src";
import {getActionCreator, creator, getUniquePath} from "./helpers";

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return {
    name: "initial",
  };
};

afterEach(() => {
  try {
    unlinkStore();
  } catch (e) {}
});

describe("module", () => {
  it("should have access to the controller`s methods and properties directly from the module", () => {
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

    const module = creator(MODULE_REDUCER, Ctl);

    expect(module.getter0()).toBe(0);

    module.setter1(1);
    expect(module.getter1()).toBe(1);

    module.value = 2;
    expect(module.getter1()).toBe(2);

    module.setter2(3);
    expect(module.getter1()).toBe(3);
  });

  it("should use Module`s method if same named public methods exists in a module and a controller", () => {
    const integrator = jest.fn();

    class Ctl extends VALID_CLASS {
      integrator(...args) {
        integrator(...args);
      }
    }

    creator(MODULE_REDUCER, Ctl);

    expect(integrator).toHaveBeenCalledTimes(0);
  });

  it("should have access to controller`s protected methods from the module", () => {
    const someFunc0 = jest.fn();
    const someFunc1 = jest.fn();

    class Ctl extends VALID_CLASS {
      _someMethod() {
        someFunc0();
      }

      _arrowMethod = () => {
        someFunc1();
      };
    }
    const module = creator(MODULE_REDUCER, Ctl);
    module._someMethod();
    module._arrowMethod();

    expect(someFunc0).toHaveBeenCalledTimes(1);
    expect(someFunc1).toHaveBeenCalledTimes(1);
  });

  it("should have access to controller`s protected method from inside another controller`s methods", () => {
    const someFunc0 = jest.fn();
    const someFunc1 = jest.fn();

    class Ctl extends VALID_CLASS {
      someMethod() {
        this._protectedMethod0();
      }

      arrowMethod = () => {
        this._protectedMethod1();
      };

      _protectedMethod0() {
        someFunc0();
      }

      _protectedMethod1() {
        someFunc1();
      }
    }
    const module = creator(MODULE_REDUCER, Ctl);

    module.someMethod();
    module.arrowMethod();

    expect(someFunc0).toHaveBeenCalledTimes(1);
    expect(someFunc1).toHaveBeenCalledTimes(1);
  });

  it("should have access to parent`s method using 'super'", () => {
    const actionCreator = getActionCreator();
    function reducer(state = "initial", action) {
      switch (action.type) {
        case actionCreator.type:
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
    const module = createModule(reducer, Ctl);
    const rootReducer = combineReducers({[getUniquePath()]: module});
    const store = createStore(rootReducer);

    module.subscribe(listener0);
    module.arrowSubscribe(listener1);

    expect(someFunc0).toHaveBeenCalledTimes(1);
    expect(someFunc1).toHaveBeenCalledTimes(1);

    store.dispatch(actionCreator("payload"));

    expect(listener0).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  it("should not use Module`s method if called from controller`s method", () => {
    const actionCreator = getActionCreator();
    function reducer(state = "initial", action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    class Ctl extends VALID_CLASS {
      someMethod() {
        return this.integrator;
      }

      someArrowMethod = () => {
        return this.integrator;
      };
    }
    const module = creator(reducer, Ctl);

    const result0 = module.someMethod();
    const result1 = module.someArrowMethod();

    expect(result0).toBe(undefined);
    expect(result1).toBe(undefined);
  });

  it("should call controllers method `_didLinkedWithStore` on get linked", () => {
    const testFunc = jest.fn();
    class Ctl extends VALID_CLASS {
      _didLinkedWithStore() {
        testFunc();
      }
    }

    creator(MODULE_REDUCER, Ctl);

    expect(testFunc).toHaveBeenCalledTimes(1);
  });

  it("should call controllers method `_didUnlinkedWithStore` on get unlinked", () => {
    const testFunc = jest.fn();
    class Ctl extends VALID_CLASS {
      _didUnlinkedWithStore() {
        testFunc();
      }
    }

    creator(MODULE_REDUCER, Ctl);

    unlinkStore();

    expect(testFunc).toHaveBeenCalledTimes(1);
  });

  it("should contain methods equally named with actions", () => {
    const actionCreator0 = getActionCreator();
    const actionCreator1 = getActionCreator();

    const module = createModule(MODULE_REDUCER, VALID_CLASS, {
      action0: {creator: actionCreator0, type: actionCreator0.type},
      action1: {creator: actionCreator1, type: actionCreator1.type},
    });

    expect(module.actions.action0).toEqual(expect.any(Function));
    expect(module.actions.action0.actionType).toEqual(actionCreator0.type);

    expect(module.actions.action1).toEqual(expect.any(Function));
    expect(module.actions.action1.actionType).toEqual(actionCreator1.type);
  });
});
