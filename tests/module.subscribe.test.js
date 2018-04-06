import {allValuesTypes, testAllValues} from "unit-tests-values-iterators";
import {noop} from "lodash";

import {linkStore, unlinkStore, RMCCtl, createModule} from "../src";
import {getActionCreator, creator} from "./helpers";

const payload0 = {
  name: "payload0",
  value: true,
};
const payload1 = {
  name: "payload1",
  value: false,
};
const initialData = {
  name: "initial",
};

const VALID_CLASS = class SCtl extends RMCCtl {
  _stateDidUpdate() {}
};
const MODULE_REDUCER = () => {
  return initialData;
};

afterEach(() => {
  unlinkStore();
});

describe("module.subscribe", () => {
  testAllValues(
    (listener, type) => {
      it(`should throw an error if get none function argument: ${listener} of type ${type}`, () => {
        const module = creator(MODULE_REDUCER, VALID_CLASS);

        expect(() => {
          module.subscribe(listener);
        }).toThrow();
      });
    },
    {exclude: [allValuesTypes.FUNCTION]}
  );

  it("should be able to get called several times with different listeners", () => {
    const module = creator(MODULE_REDUCER, VALID_CLASS);

    expect(() => {
      module.subscribe(function() {});
      module.subscribe(function() {});
    }).not.toThrow();
  });

  it("should be able to get called several times with same listener", () => {
    const module = creator(MODULE_REDUCER, VALID_CLASS);
    const listener = function() {};

    expect(() => {
      module.subscribe(listener);
      module.subscribe(listener);
    }).not.toThrow();
  });

  it("should call listener single time when state get changed once", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = creator(reducer, VALID_CLASS);
    const listener = jest.fn();

    module.subscribe(listener);
    module.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should call listener single time even it was added twice", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = creator(reducer, VALID_CLASS);
    const listener = jest.fn();

    module.subscribe(listener);
    module.subscribe(listener);
    module.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should call each listener", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = creator(reducer, VALID_CLASS);
    const listener0 = jest.fn();
    const listener1 = jest.fn();

    module.subscribe(listener0);
    module.subscribe(listener1);
    module.dispatch(actionCreator(payload0));

    expect(listener0).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  it("should call listener with prev and new state arguments", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = creator(reducer, VALID_CLASS);
    const listener = jest.fn();

    module.subscribe(listener);
    module.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledWith(initialData, payload0);
  });

  it("should return function unsubscriber", () => {
    const module = creator(MODULE_REDUCER, VALID_CLASS);

    const unsubscriber = module.subscribe(function() {});

    expect(unsubscriber).toEqual(expect.any(Function));
  });

  it("should not call listener after unsubscribe", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = creator(reducer, VALID_CLASS);
    const listener = jest.fn();
    const unsubscriber = module.subscribe(listener);

    unsubscriber();
    module.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it("should keep subscription even after relink store", () => {
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
          return action.payload;

        default:
          return state;
      }
    }
    const module = createModule(reducer, VALID_CLASS);

    function rootReducer(state = {}, action) {
      return {
        "modulePath": module.integrator("modulePath")(state["modulePath"], action),
      };
    }

    const store = createStore(rootReducer);
    const listener = jest.fn();

    module.subscribe(listener);

    unlinkStore();
    linkStore(store);

    module.dispatch(actionCreator(payload0));

    expect(listener).toHaveBeenCalledTimes(1);
  })
});
