import { linkStore, unlinkStore, RMCCtl, createModule, createStore } from '../dist';
import { DuplicateError, InsufficientDataError } from '../dist/lib/baseErrors';

import { getActionCreator, getUniquePath } from './helpers';

describe('linkStore', () => {
  afterEach(() => {
    unlinkStore();
  });

  it('should throw an error if called twice', () => {
    linkStore({});

    expect(() => {
      linkStore({});
    }).toThrow(DuplicateError);
  });

  it('should be ok after unlink store', () => {
    linkStore({});
    unlinkStore();

    expect(() => {
      linkStore({});
    }).not.toThrow();
  });
});

describe('unlinkStore', () => {
  it('should throw an error if unlink before link', () => {
    expect(() => {
      unlinkStore();
    }).toThrow(InsufficientDataError);
  });

  it('actions does not affects module after unlink store', () => {
    const stateDidUpdate = jest.fn();
    const actionCreator = getActionCreator();
    function reducer(
      state = {
        name: 'initial',
      },
      action
    ) {
      switch (action.type) {
        case actionCreator.actionType:
          return action.payload;

        default:
          return state;
      }
    }
    class Ctl extends RMCCtl {
      stateDidUpdate(...args) {
        stateDidUpdate(...args);
      }
    }
    const module = createModule({ Ctl, reducer, actions: {} });
    const modulePath = getUniquePath();
    function rootReducer(state = {}, action) {
      return {
        [modulePath]: module.integrator(modulePath)(state[modulePath], action),
      };
    }
    const store = createStore(rootReducer);

    unlinkStore();
    store.dispatch(actionCreator({}));

    expect(stateDidUpdate).toHaveBeenCalledTimes(0);
  });
});
