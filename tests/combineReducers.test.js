import {createModule, RMCCtl, combineReducers} from '../src';

const VALID_CLASS = class SCtl extends RMCCtl {};

describe('combineReducers', () => {
  it('should return a function', () => {
    const reducer = combineReducers({
      foo: () => 1,
      bar: () => 2,
    });

    expect(reducer).toEqual(expect.any(Function));
  });

  it('should call each reducer in the state map and map results into new state', () => {
    const expected = {
      foo: 1,
      bar: 2,
    };
    const reducer = combineReducers({
      foo: () => 1,
      bar: () => 2,
    });

    expect(reducer()).toEqual(expected);
  });

  it('should pass into each reducer an appropriate state, action and full path', () => {
    const fn0 = jest.fn(() => 1);
    const fn1 = jest.fn(() => 2);

    const path0 = 'foo';
    const path1 = 'bar';

    const reducer = combineReducers({
      [path0]: fn0,
      [path1]: fn1,
    });

    const state = {
      [path0]: 'oldFoo',
      [path1]: 'oldBar',
    };
    const action = {type: 'exampleAction'};

    reducer(state, action);

    expect(fn0).toHaveBeenCalledWith(state[path0], action, path0);
    expect(fn1).toHaveBeenCalledWith(state[path1], action, path1);
  });

  it('should return the original state if result values the same', () => {
    const state = {
      foo: 1,
      bar: 'bar',
      baz: {
        foo: [23],
      },
      some: ['ff', 11, true],
    };

    const reducer = combineReducers({
      foo: () => state.foo,
      bar: () => state.bar,
      baz: () => state.baz,
      some: () => state.some,
    });

    expect(reducer(state)).toBe(state);
  });

  it('should work ok either with usual reducers or a module`s integrator result', () => {
    const module0 = createModule({Ctl: VALID_CLASS, reducer: () => 0, actions: {}});
    const module1 = createModule({Ctl: VALID_CLASS, reducer: () => 1, actions: {}});

    const expected = {
      path0: 0,
      path1: 1,
      path2: 2,
    };

    const reducer = combineReducers({
      path0: module0,
      path1: module1,
      path2: () => 2,
    });

    expect(reducer()).toEqual(expected);
  });
});
