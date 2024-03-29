import { allValuesTypes, testAllValues } from 'unit-tests-values-iterators';

import { unlinkStore, createModule, RMCCtl, InvalidParamsError } from '../dist';

import { getActionCreator } from './helpers';

const VALID_CLASS = class SCtl extends RMCCtl {};
const MODULE_REDUCER = () => {
  return {
    name: 'initial',
  };
};

describe('createModule', () => {
  afterEach(() => {
    try {
      unlinkStore();
    } catch (e) {}
  });

  it('should throw an error if valid params is supplied as separate arguments', () => {
    const actionCreator = getActionCreator();

    expect(() => {
      createModule(VALID_CLASS, MODULE_REDUCER, {
        action0: { creator: actionCreator, type: actionCreator.actionType },
      });
    }).toThrow(InvalidParamsError);
  });

  testAllValues((ctl, type) => {
    it(`should throw an error if a controller is not inherited from the RMCCtl: "${ctl}" of type "${type}"`, () => {
      const ctlParams = [];

      expect(() => {
        createModule({ Ctl: ctl, ctlParams, reducer: MODULE_REDUCER, actions: {} });
      }).toThrow(InvalidParamsError);
    });
  });

  testAllValues(
    (ctlParams, type) => {
      it(`should throw an error if a controllers params is not an array: "${ctlParams}" of type "${type}"`, () => {
        expect(() => {
          createModule({ Ctl: VALID_CLASS, ctlParams, reducer: MODULE_REDUCER, actions: {} });
        }).toThrow(InvalidParamsError);
      });
    },
    {
      exclude: [allValuesTypes.ARRAY, allValuesTypes.UNDEFINED],
    }
  );

  it('should throw an error if a controller passed without params', () => {
    class SCtl extends RMCCtl {}

    expect(() => {
      createModule({ Ctl: SCtl, reducer: MODULE_REDUCER, actions: {} });
    }).toThrow();
  });

  it('should not throw an error if a controller passed with params array', () => {
    const ctlParams = ['foo', true];
    class SCtl extends RMCCtl {
      constructor(str, bool, ...rest) {
        super(...rest);
      }
    }

    expect(() => {
      createModule({ Ctl: SCtl, ctlParams, reducer: MODULE_REDUCER, actions: {} });
    }).not.toThrow();
  });

  testAllValues(
    (reducer, type) => {
      it(`should throw an error if a reducer is not a function: "${reducer}" of type "${type}"`, () => {
        const ctlParams = [];

        expect(() => {
          createModule({ Ctl: VALID_CLASS, ctlParams, reducer, actions: {} });
        }).toThrow(InvalidParamsError);
      });
    },
    { exclude: [allValuesTypes.FUNCTION] }
  );

  testAllValues(
    (actions, type) => {
      it(`should throw an error if actions is not an object: "${actions}" of type "${type}"`, () => {
        const ctlParams = [];

        expect(() => {
          createModule({ Ctl: VALID_CLASS, ctlParams, reducer: MODULE_REDUCER, actions });
        }).toThrow(InvalidParamsError);
      });
    },
    { exclude: [allValuesTypes.PLAIN_OBJECT] }
  );

  testAllValues(
    (creator, creatorType) => {
      testAllValues(
        (type, actionTypeType) => {
          const creatorString = `creator: ${creator} of type ${creatorType};`;
          const typeString = `type: ${type} of type ${actionTypeType};`;
          const ctlParams = [];

          it(`should throw an error if some action has wrong creator or type; ${creatorString} ${typeString}`, () => {
            expect(() => {
              createModule({
                Ctl: VALID_CLASS,
                ctlParams,
                reducer: MODULE_REDUCER,
                actions: {
                  action0: { creator, type },
                },
              });
            }).toThrow(InvalidParamsError);
          });
        },
        { exclude: [allValuesTypes.STRING, allValuesTypes.NUMBER, allValuesTypes.UNDEFINED] }
      );
    },
    { exclude: [allValuesTypes.FUNCTION, allValuesTypes.UNDEFINED] }
  );

  it('should not throw an error if action has not a creator', () => {
    expect(() => {
      const ctlParams = [];

      createModule({
        Ctl: VALID_CLASS,
        ctlParams,
        reducer: MODULE_REDUCER,
        actions: {
          action0: {
            type: 'type',
          },
        },
      });
    }).not.toThrow();
  });

  it('should not throw an error if action has not a type', () => {
    expect(() => {
      const ctlParams = [];

      createModule({
        Ctl: VALID_CLASS,
        ctlParams,
        reducer: MODULE_REDUCER,
        actions: {
          action0: {},
        },
      });
    }).not.toThrow();
  });

  it('should not throw an error if action has a correct creator and a type', () => {
    expect(() => {
      const actionCreator = getActionCreator();
      const ctlParams = [];

      createModule({
        Ctl: VALID_CLASS,
        ctlParams,
        reducer: MODULE_REDUCER,
        actions: {
          action0: {
            creator: actionCreator,
            type: actionCreator.actionType,
          },
        },
      });
    }).not.toThrow();
  });

  testAllValues(
    (proxy, type) => {
      it(`should throw an error if some action has wrong proxy: ${proxy} of type ${type}`, () => {
        expect(() => {
          const ctlParams = [];

          createModule({
            Ctl: VALID_CLASS,
            ctlParams,
            reducer: MODULE_REDUCER,
            actions: {
              action0: { proxy },
            },
          });
        }).toThrow(InvalidParamsError);
      });
    },
    {
      // there is a situation when neither a type, a creator and a proxy passed in - there will be a regular action with autogenerated type
      exclude: [allValuesTypes.UNDEFINED],
    }
  );

  it('should not throw an error if action has a correct proxy', () => {
    expect(() => {
      const ctlParams = [];

      createModule({
        Ctl: VALID_CLASS,
        ctlParams,
        reducer: MODULE_REDUCER,
        actions: {
          action0: {
            proxy: getActionCreator(),
          },
        },
      });
    }).not.toThrow();
  });

  it('should pass the controller params into the controller constructor before the actions', () => {
    const param0 = 'foo';
    const param1 = 1;
    const param2 = false;
    const ctlParams = [param0, param1, param2];
    const spy = jest.fn();

    class Ctl extends RMCCtl {
      constructor(param0, param1, param2, ...rest) {
        super(...rest);

        spy(param0, param1, param2);
      }
    }
    createModule({ Ctl, ctlParams, reducer: MODULE_REDUCER, actions: {} });

    expect(spy).toHaveBeenCalledWith(...ctlParams);
  });

  it('should not throw an error if ctl class doesn`t have `stateDidUpdate`, `didLinkedWithStore` and `didUnlinkedWithStore` methods', () => {
    class Ctl extends RMCCtl {}
    const ctlParams = [];

    expect(() => {
      createModule({ Ctl, ctlParams, reducer: () => {}, actions: {} });
    }).not.toThrow();
  });

  it('should return object with method named integrator', () => {
    const ctlParams = [];
    const module = createModule({ Ctl: VALID_CLASS, ctlParams, reducer: () => {}, actions: {} });

    expect(module.integrator).toEqual(expect.any(Function));
  });

  it('should return object with method named subscribe', () => {
    const ctlParams = [];
    const module = createModule({ Ctl: VALID_CLASS, ctlParams, reducer: () => {}, actions: {} });

    expect(module.subscribe).toEqual(expect.any(Function));
  });

  it('should return different instance on each call', () => {
    const ctlParams = [];
    const reducer = () => {};

    const module0 = createModule({ Ctl: VALID_CLASS, ctlParams, reducer, actions: {} });
    const module1 = createModule({ Ctl: VALID_CLASS, ctlParams, reducer, actions: {} });

    expect(module0).not.toBe(module1);
  });
});
