import {createStore, unlinkStore, RMCCtl, createModule} from '../src';

const VALID_CLASS = class SCtl extends RMCCtl {
  _stateDidUpdate() {}
};
const INVALID_CLASS = class SCtl extends RMCCtl {};

describe('createStore', () => {
    afterEach(() => {
      try {
        unlinkStore();
      } catch(e) {}
    });

    it('should throw an error if called twice', () => {
        createStore(() => {});

        expect(() => {
            createStore(() => {});
        }).toThrow();
    });

  it("should link store with valid module after invalid one", () => {
    try {
      createModule(() => {}, INVALID_CLASS);
    } catch(e) {}

    expect(() => {
      const module = createModule(() => {}, VALID_CLASS);

      const modulePath = 'modulePath';
      function rootReducer(state = {}, action) {
        return {
          [modulePath]: module.integrator(modulePath)(state[modulePath], action),
        };
      }

      createStore(rootReducer);
    }).not.toThrow();
  })
});
