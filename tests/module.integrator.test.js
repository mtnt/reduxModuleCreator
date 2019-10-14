import {allValuesTypes, testAllValues} from 'unit-tests-values-iterators';

import {InvalidParamsError} from '../src/lib/baseErrors'
import {createModule, createStore, RMCCtl} from '../src';
import {pathDelimiter} from '../src/lib/constansts';

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return {
    name: 'initial',
  };
};

describe('module.integrator()', () => {
  testAllValues(
    (path, type) => {
      const desc_100 =
        `should throw an error if single argument "${path}" of type` + ` "${type}" is not compatible with path type`;
      it(desc_100, () => {
        const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

        expect(() => {
          module.integrator(path);
        }).toThrow(InvalidParamsError);
      });
    },
    {exclude: [allValuesTypes.STRING, allValuesTypes.ARRAY]}
  );

  it('should throw an error if path is empty string', () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    expect(() => {
      module.integrator('');
    }).toThrow(InvalidParamsError);
  });

  it('should throw an error if path is empty array', () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    expect(() => {
      module.integrator([]);
    }).toThrow(InvalidParamsError);
  });

  it('should throw an error if path is array with at least one nonestring value', () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    expect(() => {
      module.integrator(['foo', 1, 'bar']);
    }).toThrow(InvalidParamsError);
  });

  it('should throw an error if path is array with at least one empty string value', () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    expect(() => {
      module.integrator(['foo', '', 'bar']);
    }).toThrow(InvalidParamsError);
  });

  it('should throw an error if path is changed', () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    module.integrator('path0');

    expect(() => {
      module.integrator('path1');
    }).toThrow(InvalidParamsError);
  });

  it('should correct handle a combination of array and dot separated string', () => {
    const testValue = 'foo';
    class Ctl extends RMCCtl {
      getState() {
        return this.ownState;
      }
    }

    const module = createModule({Ctl, reducer: () => testValue});

    const pathParts = ['first', 'second', 'third', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const testPath = [
      pathParts[0],
      `${pathParts[1]}${pathDelimiter}${pathParts[2]}`,
      pathParts[3],
      [pathParts[4], [pathParts[5], pathParts[6]]],
      [[pathParts[7], pathParts[8]]],
    ];

    function rootReducer(state = {}, action) {
      return {
        [pathParts[0]]: {
          [pathParts[1]]: {
            [pathParts[2]]: {
              [pathParts[3]]: {
                [pathParts[4]]: {
                  [pathParts[5]]: {
                    [pathParts[6]]: {
                      [pathParts[7]]: {
                        [pathParts[8]]: module.integrator(testPath)(
                          state[pathParts.join(pathDelimiter)],
                          action,
                          testPath
                        ),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    }

    createStore(rootReducer);

    expect(module.getState()).toBe(testValue);
  });

  it('should return a function that is the reducer like in the arguments list but not exactly', () => {
    const value = 'foo';
    const reducer = () => value;

    const module = createModule({Ctl: VALID_CLASS, reducer});
    const resultReducer = module.integrator('path');

    expect(resultReducer).not.toBe(reducer);
    expect(resultReducer()).toBe(value);
  });

  it('should return a function that has access to the action via context', () => {
    const reducer = function() {
      expect(this.actions).toEqual(expect.any(Object));
    };
    const module = createModule({Ctl: VALID_CLASS, reducer});
    const resultReducer = module.integrator('path');

    resultReducer();
  });

  it("should not throw an error if path is 'false digit'", () => {
    const module = createModule({Ctl: VALID_CLASS, reducer: MODULE_REDUCER});

    expect(() => {
      module.integrator('0');
    }).not.toThrow();
  });
});
