import {allValuesTypes, testAllValues} from "unit-tests-values-iterators";

import {createModule, RMCCtl} from "../src";

const VALID_CLASS = class SCtl extends RMCCtl {
  _stateDidUpdate() {}
};
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
        const module = createModule(MODULE_REDUCER, VALID_CLASS);

        expect(() => {
          module.integrator(path);
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.STRING, allValuesTypes.ARRAY]}
  );

  it("should throw an error if path is empty string", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator("");
    }).toThrow();
  });

  it("should throw an error if path is empty array", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator([]);
    }).toThrow();
  });

  it("should throw an error if path is array with at least one nonestring value", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.integrator(["foo", 1, "bar"]);
    }).toThrow();
  });

  it("should throw an error if path is changed", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);

    module.integrator("path0");

    expect(() => {
      module.integrator("path1");
    }).toThrow();
  });

  it("should return a function the same as a reducer in the arguments list", () => {
    const module = createModule(MODULE_REDUCER, VALID_CLASS);
    const resultReducer = module.integrator("path");

    expect(resultReducer).toBe(MODULE_REDUCER);
  });
});
