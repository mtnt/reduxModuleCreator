import { createStore, unlinkStore, RMCCtl, createModule } from '../dist';
import { DuplicateError } from '../dist/lib/baseErrors';
import { getUniquePath } from './helpers';

const VALID_CLASS = class SCtl extends RMCCtl {};
const INVALID_CLASS = class SCtl {};

describe('createStore', () => {
  afterEach(() => {
    try {
      unlinkStore();
    } catch (e) {}
  });

  it('should throw an error if called twice', () => {
    createStore(() => {});

    expect(() => {
      createStore(() => {});
    }).toThrow(DuplicateError);
  });

  it('should link store with valid module after invalid one', () => {
    try {
      createModule({ Ctl: INVALID_CLASS, reducer: () => {}, actions: {} });
    } catch (e) {}

    expect(() => {
      const module = createModule({ Ctl: VALID_CLASS, reducer: () => {}, actions: {} });

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
