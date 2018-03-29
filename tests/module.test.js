import {allValuesTypes, testAllValues} from "unit-tests-values-iterators"

import {createStore, unlinkStore, createModule, RMCCtl} from "../src";

const VALID_CLASS = class SCtl extends RMCCtl {
  _stateDidUpdate() {}
};
const MODULE_REDUCER = () => {
  return {
    foo: 'bar',
    bar: 'foo',
  };
};

function creator(reducer, ctl, modulePath = "modulePath") {
  const module = createModule(reducer, ctl);

  function rootReducer(state = {}, action) {
    return {
      [modulePath]: module.integrator(modulePath)(state[modulePath], action),
    };
  }

  createStore(rootReducer);

  return module;
}

describe("module", () => {
  beforeEach(() => {
    try{
      unlinkStore();
    } catch(e) {}
  });

  it("should have access to the controller`s methods and properties directly", () => {
    class Ctl extends VALID_CLASS {
      getter0() {
        return 0;
      }

      setter1(value) {
        this.value1 = value;
      }

      getter1() {
        return this.value1;
      }
    }

    const module = creator(() => {}, Ctl);

    expect(module.getter0()).toBe(0);

    module.setter1(1);
    expect(module.getter1()).toBe(1);

    module.value1 = 2;
    expect(module.getter1()).toBe(2);
  });

  it("should use Module`s method if same named public methods exists in a module and a controller", () => {
    const integrator = jest.fn();

    class Ctl extends VALID_CLASS {
      integrator(...args) {
        integrator(...args);
      }
    }

    creator(() => {}, Ctl);

    expect(integrator).toHaveBeenCalledTimes(0);
  });

  it("should have access to controller`s private methods from outside", () => {
    const someFunc = jest.fn();

    class Ctl extends VALID_CLASS {
      _someMethod() {
        someFunc();
      }
    }
    const module = creator(() => {}, Ctl);
    module._someMethod();

    expect(someFunc).toHaveBeenCalled();
  });

  it("should have access to controller`s protected method from inside another controller`s methods", () => {
    const someFunc = jest.fn();

    class Ctl extends VALID_CLASS {
      someMethod() {
        this._protectedMethod();
      }

      _protectedMethod() {
        someFunc();
      }
    }
    const module = creator(() => {}, Ctl);

    module.someMethod();

    expect(someFunc).toHaveBeenCalled();
  });

  it("should have access to own state inside controller`s methods", () => {
    const ownState = {
      foo: 'bar',
      bar: 'foo',
    };
    const reducer = (state = {}, action) => {
      return ownState;
    };

    class Ctl extends VALID_CLASS {
      getter() {
        return this.ownState;
      }
    }

    const module = creator(reducer, Ctl);

    expect(module.getter()).toBe(ownState);
  });
});

describe('module.integrator()', () => {
  testAllValues((path, type) => {
    const desc_100 = `should throw an error if single argument "${path}" of type` +
      ` "${type}" is not compatible with path type`;
    it(desc_100, () => {
      const module = createModule(() => {}, VALID_CLASS);

      expect(() => {
        module.integrator(path);
      }).toThrow();
    });
  }, {exclude: [allValuesTypes.STRING, allValuesTypes.ARRAY]});

  it('should throw an error if path is empty string', () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator('');
    }).toThrow();
  });

  it('should throw an error if path is empty array', () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator([]);
    }).toThrow();
  });

  it('should throw an error if path is array with at least one nonestring value', () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator(['foo', 1, 'bar']);
    }).toThrow();
  });

  it("should throw an error if path is changed", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    module.integrator('path0');

    expect(() => {
      module.integrator('path1');
    }).toThrow();
  });

  it('should return a function the same as a reducer in the arguments list', () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);
    const resultReducer = module.integrator('path');

    expect(resultReducer).toBe(MODULE_REDUCER);
  });
});

describe('module.dispatch', () => {
  const action0 = 'action0';
  const action1 = 'action1';
  const payload0 = 'payload0';
  const payload1 = 'payload1';
  const initialData = 'initialData';

  it("does not affect deinitialized module", () => {
    const stateDidUpdate = jest.fn();
    let module;

    beforeAll(() => {
      try{
        unlinkStore();
      } catch(e) {}

      function reducer(state = initialData, action) {
        switch(action.type) {
          case action0:
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
      module = creator(reducer, Ctl);

      module.deinitialize();
      module.dispatch({type: action0, payload: payload0});
    })

    expect.assertions(1);
    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });

  describe('called single time', () => {
    const stateDidUpdate = jest.fn();
    let module;

    beforeAll(() => {
      try{
        unlinkStore();
      } catch(e) {}

      function reducer(state = initialData, action) {
        switch (action.type) {
          case action0:
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
      module = creator(reducer, Ctl);

      module.dispatch({type: action0, payload: payload0});
    });

    it('should call `_stateDidUpdate`', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenCalledTimes(1);
    });

    it('should call `_stateDidUpdate` with previousState', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenCalledWith(initialData);
    });

    it('should change own state property to new state', () => {
      expect.assertions(1);
      expect(module.ownState).toBe(payload0);
    });
  });

  describe('called several times with a same action but different payloads', () => {
    const stateDidUpdate = jest.fn();
    let module;

    beforeAll(() => {
      try{
        unlinkStore();
      } catch(e) {}

      function reducer(state = initialData, action) {
        switch(action.type) {
          case action0:
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
      module = creator(reducer, Ctl);

      module.dispatch({type: action0, payload: payload0});
      module.dispatch({type: action0, payload: payload1});
    });

    it('should call `stateDidUpdate` each time', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenCalledTimes(2);
    });

    it('should call `stateDidUpdate` with a result of handling a last action', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenLastCalledWith(payload0); // previous state
    });

    it('should change own state property a result of handling a last action', () => {
      expect.assertions(1);
      expect(module.ownState).toBe(payload1);
    });
  });

  describe('called several times with totally same actions including payloads', () => {
    const stateDidUpdate = jest.fn();
    let module;

    beforeAll(() => {
      try{
        unlinkStore();
      } catch(e) {}

      function reducer(state = initialData, action) {
        switch(action.type) {
          case action0:
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
      module = creator(reducer, Ctl);

      module.dispatch({type: action0, payload: payload0});
      module.dispatch({type: action0, payload: payload0});
    });

    it('should call `stateDidUpdate` just single time', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('called with an action that shouldn`t affect module`s state', () => {
    const stateDidUpdate = jest.fn();
    let module;

    beforeAll(() => {
      try {
        unlinkStore();
      } catch (e) {}

      function reducer(state = initialData, action) {
        switch(action.type) {
          case action0:
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
      module = creator(reducer, Ctl);

      module.dispatch({type: action1, payload: payload1});
    });

    it('should not call `stateDidUpdate` at all', () => {
      expect.assertions(1);
      expect(stateDidUpdate).toHaveBeenCalledTimes(0);
    });
  });
});
