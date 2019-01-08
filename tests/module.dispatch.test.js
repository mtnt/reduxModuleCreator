import {createStore, unlinkStore, RMCCtl, createModule, combineReducers} from "../src";
import {getActionCreator, getUniquePath} from "./helpers";

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

describe("module.dispatch", () => {
  it("called single time", () => {
    const actionCreator = getActionCreator();

    const module = createModule(VALID_CLASS, MODULE_REDUCER, {
      action: {creator: actionCreator, type: actionCreator.type},
    });
    const rootReducer = combineReducers({[getUniquePath()]: module});
    const store = createStore(rootReducer);

    const dispatchSpy = jest.spyOn(store, "dispatch");

    module.actions.action();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it("called several times with a same action but different payloads", () => {
    const actionCreator = getActionCreator();

    const module = createModule(VALID_CLASS, MODULE_REDUCER, {
      action: {creator: actionCreator, type: actionCreator.type},
    });
    const rootReducer = combineReducers({[getUniquePath()]: module});
    const store = createStore(rootReducer);

    const dispatchSpy = jest.spyOn(store, "dispatch");

    module.actions.action(payload0);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenLastCalledWith({
      type: module.actions.action.actionType,
      payload: payload0,
    });

    module.actions.action(payload1);

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenLastCalledWith({
      type: module.actions.action.actionType,
      payload: payload1,
    });
  });

  it("called several times with totally same actions (including payloads)", () => {
    const actionCreator = getActionCreator();

    const module = createModule(VALID_CLASS, MODULE_REDUCER, {
      action: {creator: actionCreator, type: actionCreator.type},
    });
    const rootReducer = combineReducers({[getUniquePath()]: module});
    const store = createStore(rootReducer);

    const dispatchSpy = jest.spyOn(store, "dispatch");

    module.actions.action(payload0);
    module.actions.action(payload0);

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenLastCalledWith({
      type: module.actions.action.actionType,
      payload: payload0,
    });
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

    const module = createModule(Ctl, reducer);
    const rootReducer = combineReducers({[getUniquePath()]: module});

    const store = createStore(rootReducer);

    store.dispatch(actionCreator1(payload1));

    // should not call `stateDidUpdate` at all
    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });

  it("should use action with type based on specified", () => {
    const actionCreator = getActionCreator();

    let module;

    const spy = jest.fn();
    const reducer = function(state = {}, action) {
      switch (action.type) {
        case module.actions.action.actionType:
          spy(action.payload);
      }
    };

    module = createModule(VALID_CLASS, reducer, {
      action: {creator: actionCreator, type: actionCreator.type},
    });

    const rootReducer = combineReducers({[getUniquePath()]: module});
    createStore(rootReducer);

    module.actions.action(payload0);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(payload0);
  });

  it("should throw an error while store is unlinked", () => {
    const actionCreator = getActionCreator();

    const module = createModule(VALID_CLASS, MODULE_REDUCER, {
      action: {creator: actionCreator, type: actionCreator.type},
    });
    const rootReducer = combineReducers({[getUniquePath()]: module});

    createStore(rootReducer);

    unlinkStore();

    expect(() => {
      module.actions.action(payload0);
    }).toThrow();
  });

  it("should use proxied action", () => {
    const actionCreator = getActionCreator();

    const innerModule = createModule(VALID_CLASS, MODULE_REDUCER, {
      innerAction: {creator: actionCreator, type: actionCreator.type},
    });

    function outerReducer(state = {}, action, rootPath) {
      const innerPath = "inner";

      return {
        [innerPath]: innerModule.integrator(innerPath)(state[innerPath], action, [rootPath, innerPath]),
      };
    }
    const outerModule = createModule(VALID_CLASS, outerReducer, {
      outerAction: {proxy: innerModule.actions.innerAction},
    });

    const spy = jest.fn();

    function rootReducer(state = {}, action) {
      const outerPath = "outer";

      spy(action);

      return {
        [outerPath]: outerModule.integrator(outerPath)(state[outerPath], action, outerPath),
      };
    }

    createStore(rootReducer);

    outerModule.actions.outerAction();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith({type: innerModule.actions.innerAction.actionType});
  });
});
