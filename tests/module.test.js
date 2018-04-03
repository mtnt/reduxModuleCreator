import {noop} from 'lodash';

import {unlinkStore, RMCCtl} from "../src";
import {creator} from './helpers';

const VALID_CLASS = class SCtl extends RMCCtl {
  _stateDidUpdate() {}
};
const MODULE_REDUCER = () => {
  return {
    name: "initial",
  };
};

afterEach(() => {
  unlinkStore();
});

describe("module", () => {
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

    const module = creator(MODULE_REDUCER, Ctl);

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

    creator(MODULE_REDUCER, Ctl);

    expect(integrator).toHaveBeenCalledTimes(0);
  });

  it("should have access to controller`s protected methods from outside", () => {
    const someFunc = jest.fn();

    class Ctl extends VALID_CLASS {
      _someMethod() {
        someFunc();
      }
    }
    const module = creator(MODULE_REDUCER, Ctl);
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
    const module = creator(MODULE_REDUCER, Ctl);

    module.someMethod();

    expect(someFunc).toHaveBeenCalled();
  });
});
