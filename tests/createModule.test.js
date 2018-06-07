import {allValuesTypes, testAllValues} from "unit-tests-values-iterators";

import {getActionCreator} from "./helpers";

import {createStore, unlinkStore, createModule, RMCCtl} from "../src";

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return {
    name: "initial",
  };
};

describe("createModule", () => {
  afterEach(() => {
    try {
      unlinkStore();
    } catch (e) {}
  });

  it("should get arguments as a list or an object", () => {
    const actionCreator = getActionCreator();

    const module0 = createModule(MODULE_REDUCER, VALID_CLASS, {action0: {creator: actionCreator, type: actionCreator.type}});
    const module1 = createModule({
      reducer: MODULE_REDUCER,
      Ctl: VALID_CLASS,
      actions: {action0: {creator: actionCreator, type: actionCreator.type}},
    });

    expect(JSON.stringify(module0)).toEqual(JSON.stringify(module1));
  });

  testAllValues(
    (reducer, type) => {
      it(`should throw an error if first argument is not a function: "${reducer}" of type "${type}"`, () => {
        expect(() => {
          createModule(reducer, VALID_CLASS);
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.FUNCTION]}
  );

  testAllValues((ctl, type) => {
    it(`should throw an error if second argument is not inherited from the RMCCtl: "${ctl}" of type "${type}"`, () => {
      expect(() => {
        createModule(() => {}, ctl);
      }).toThrow();
    });
  });

  testAllValues((actions, type) => {
    it(`should throw an error if actions is not an object: "${actions}" of type "${type}"`, () => {
      expect(() => {
        createModule(MODULE_REDUCER, VALID_CLASS, actions);
      }).toThrow();
    });
  }, {exclude: [allValuesTypes.PLAIN_OBJECT, allValuesTypes.UNDEFINED]});

  it("should not throw an error if ctl class doesn`t have `_stateDidUpdate` method", () => {
    class Ctl extends RMCCtl {}

    expect(() => {
      createModule(() => {}, Ctl);
    }).not.toThrow();
  });

  it("should fire warning if a controller has a same named method or property with Module", () => {
    class Ctl extends VALID_CLASS {
      integrator() {}
    }

    const warning = jest.spyOn(console, "warn");

    createModule(() => {}, Ctl);

    expect(warning).toHaveBeenCalled();
  });

  it("should fire error if a controller has a same named private method or property with Module", () => {
    class Ctl extends VALID_CLASS {
      __initializeMdl() {}
    }

    expect(() => {
      createModule(() => {}, Ctl);
    }).toThrow();
  });

  it("should return object with method integrator", () => {
    const module = createModule(() => {}, VALID_CLASS);

    expect(module.integrator).toEqual(expect.any(Function));
  });

  it("should return different object on each call", () => {
    const reducer = () => {};

    const module0 = createModule(reducer, VALID_CLASS);
    const module1 = createModule(reducer, VALID_CLASS);

    expect(module0).not.toBe(module1);
  });
});
