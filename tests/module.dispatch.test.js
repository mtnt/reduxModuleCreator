import {noop} from "lodash";

import {createStore, unlinkStore, RMCCtl, createModule} from "../src";
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
const VALID_CLASS = class SCtl extends RMCCtl {};

afterEach(() => {
  try {
    unlinkStore();
  } catch (e) {}
});

describe("module.dispatch", () => {
  it("does not affect deinitialized module", () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
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
    const module = createModule(reducer, Ctl);
    function rootReducer(state = {}, action) {
      return {
        modulePath: module.integrator("modulePath")(state.modulePath, action),
      };
    }
    const store = createStore(rootReducer);

    module.deinitialize();
    store.dispatch(actionCreator(payload0));

    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });

  it("called single time", () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
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
    const module = creator(reducer, Ctl);

    module.dispatch(actionCreator(payload0));

    // should call `_stateDidUpdate`
    expect(stateDidUpdate).toHaveBeenCalledTimes(1);

    // should call `_stateDidUpdate` with previousState
    expect(stateDidUpdate).toHaveBeenCalledWith(initialData);

    // should change own state property to new state
    expect(module.ownState).toEqual(payload0);
  });

  it("called several times with a same action but different payloads", () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
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
    const module = creator(reducer, Ctl);

    module.dispatch(actionCreator(payload0));
    module.dispatch(actionCreator(payload1));

    // should call `stateDidUpdate` each time
    expect(stateDidUpdate).toHaveBeenCalledTimes(2);

    // should call `stateDidUpdate` with a result of handling a last action
    expect(stateDidUpdate).toHaveBeenLastCalledWith(payload0); // previous state

    // should change own state property a result of handling a last action
    expect(module.ownState).toEqual(payload1);
  });

  it("called several times with totally same actions including payloads", () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator.type:
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
    const module = creator(reducer, Ctl);

    module.dispatch(actionCreator(payload0));
    module.dispatch(actionCreator(payload0));

    // should call `stateDidUpdate` just single time
    expect(stateDidUpdate).toHaveBeenCalledTimes(1);
  });

  it("called with an action that shouldn`t affect module`s state", () => {
    const stateDidUpdate = jest.fn();
    const actionCreator0 = getActionCreator();
    const actionCreator1 = getActionCreator();
    function reducer(state = initialData, action) {
      switch (action.type) {
        case actionCreator0.type:
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
    const module = creator(reducer, Ctl);

    module.dispatch(actionCreator1(payload1));

    // should not call `stateDidUpdate` at all
    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });

  it("should throw an error while store is unlinked", () => {
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

    unlinkStore();

    expect(() => {
      module.dispatch(actionCreator(payload0));
    }).toThrow();
  });
});
