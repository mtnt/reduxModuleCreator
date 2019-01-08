import get from "lodash.get";
import {allValuesTypes, testAllValues} from "unit-tests-values-iterators";

import {createModule, createStore, RMCCtl} from "../src";

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return {
    name: "initial",
  };
};

describe("module.integrator()", () => {
  testAllValues(
    (path, type) => {
      const desc_100 =
        `should throw an error if single argument "${path}" of type` + ` "${type}" is not compatible with path type`;
      it(desc_100, () => {
        const module = createModule(VALID_CLASS, MODULE_REDUCER);

        expect(() => {
          module.integrator(path);
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.STRING, allValuesTypes.ARRAY]}
  );

  it("should throw an error if path is empty string", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);

    expect(() => {
      module.integrator("");
    }).toThrow();
  });

  it("should throw an error if path is empty array", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);

    expect(() => {
      module.integrator([]);
    }).toThrow();
  });

  it("should throw an error if path is array with at least one nonestring value", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);

    expect(() => {
      module.integrator(["foo", 1, "bar"]);
    }).toThrow();
  });

  it("should throw an error if path is changed", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);

    module.integrator("path0");

    expect(() => {
      module.integrator("path1");
    }).toThrow();
  });

  it("should correct handle a combination of array and dot separated string", () => {
    const testValue = "foo";
    class Ctl extends RMCCtl {
      getState() {
        return this.ownState;
      }
    }

    const module = createModule(Ctl, () => testValue);

    const pathParts = ["first", "second", "third", "four", "fifth"];

    function rootReducer(state = {}, action) {
      return {
        [pathParts[0]]: {
          [pathParts[1]]: {
            [pathParts[2]]: {
              [pathParts[3]]: module.integrator([pathParts[0], `${pathParts[1]}.${pathParts[2]}`, pathParts[3]])(
                state[pathParts[0]],
                action,
                pathParts[0]
              ),
            },
          },
        },
      };
    }

    createStore(rootReducer);

    expect(module.getState()).toBe(testValue);
  });

  it("should return a function that is the reducer in the arguments list", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);
    const resultReducer = module.integrator("path");

    expect(resultReducer).toBe(MODULE_REDUCER);
  });

  it("should not throw an error if path is 'false digit'", () => {
    const module = createModule(VALID_CLASS, MODULE_REDUCER);

    expect(() => {
      module.integrator("0");
    }).not.toThrow();
  });
});
