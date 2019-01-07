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

    expect(() => {
      createModule(VALID_CLASS, MODULE_REDUCER, {
        action0: {creator: actionCreator, type: actionCreator.type},
      });

      createModule({
        Ctl: VALID_CLASS,
        reducer: MODULE_REDUCER,
        actions: {action0: {creator: actionCreator, type: actionCreator.type}},
      });
    }).not.toThrow();
  });

  testAllValues((ctl, type) => {
    it(`should throw an error if a controller is not inherited from the RMCCtl: "${ctl}" of type "${type}"`, () => {
      expect(() => {
        createModule(ctl, () => {});
      }).toThrow();

      expect(() => {
        createModule({Ctl: ctl, reducer: () => {}});
      }).toThrow();
    });
  });

  testAllValues(
    (reducer, type) => {
      it(`should throw an error if a reducer is not a function: "${reducer}" of type "${type}"`, () => {
        expect(() => {
          createModule(VALID_CLASS, reducer);
        }).toThrow();

        expect(() => {
          createModule({Ctl: VALID_CLASS, reducer});
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.FUNCTION]}
  );

  testAllValues(
    (actions, type) => {
      it(`should throw an error if actions is not an object: "${actions}" of type "${type}"`, () => {
        expect(() => {
          createModule(VALID_CLASS, MODULE_REDUCER, actions);
        }).toThrow();

        expect(() => {
          createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER, actions});
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.PLAIN_OBJECT, allValuesTypes.UNDEFINED]}
  );

  it("should not throw an error if ctl class doesn`t have `_stateDidUpdate` method", () => {
    class Ctl extends RMCCtl {}

    expect(() => {
      createModule(Ctl, () => {});
    }).not.toThrow();
  });

  it("should fire a warning if a controller has a same named method or property with Module", () => {
    class Ctl extends VALID_CLASS {
      integrator() {}
    }

    const warning = jest.spyOn(console, "warn");

    createModule(Ctl, () => {});

    expect(warning).toHaveBeenCalled();
  });

  it("should throw an error if a controller has a same named private method or property with Module", () => {
    class Ctl extends VALID_CLASS {
      __initializeMdl() {}
    }

    expect(() => {
      createModule(Ctl, () => {});
    }).toThrow();
  });

  it("should return object with method integrator", () => {
    const module = createModule(VALID_CLASS, () => {});

    expect(module.integrator).toEqual(expect.any(Function));
  });

  it("should return different object on each call", () => {
    const reducer = () => {};

    const module0 = createModule(VALID_CLASS, reducer);
    const module1 = createModule(VALID_CLASS, reducer);

    expect(module0).not.toBe(module1);
  });
});
