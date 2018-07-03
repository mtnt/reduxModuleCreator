import {createStore, unlinkStore, RMCCtl, createModule} from "../src";
import {getUniquePath} from "./helpers";

const VALID_CLASS = class SCtl extends RMCCtl {};
const INVALID_CLASS = class SCtl extends RMCCtl {}; // there is no option to make class invalid (yet)

describe("createStore", () => {
  afterEach(() => {
    try {
      unlinkStore();
    } catch (e) {}
  });

  it("should throw an error if called twice", () => {
    createStore(() => {});

    expect(() => {
      createStore(() => {});
    }).toThrow();
  });

  it("should link store with valid module after invalid one", () => {
    try {
      createModule(() => {}, INVALID_CLASS);
    } catch (e) {}

    expect(() => {
      const module = createModule(() => {}, VALID_CLASS);

      const modulePath = getUniquePath();
      function rootReducer(state = {}, action) {
        return {
          [modulePath]: module.integrator(modulePath)(state[modulePath], action),
        };
      }

      createStore(rootReducer);
    }).not.toThrow();
  });
});
