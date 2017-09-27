import {createStore, createModule, Ctl} from '../src';

import {allValuesTypes, testAllValues} from './lib';


createStore(() => {});

describe('createModule', () => {
    it('should throw an error if first argument is not a function', () => {
        expect(() => {
            createModule();
        }).toThrow();
    });

    it('should throw an error if second argument is not inherited from the Ctl', () => {
        expect(() => {
            createModule(() => {}, {});
        }).toThrow();
    });

    it('should return object with methods', () => {
        class SCtl extends Ctl {}

        const module = createModule(() => {}, SCtl);

        expect(module.integrator).toEqual(expect.any(Function));
        expect(module.getController).toEqual(expect.any(Function));
    });

    it('should return different object on each call', () => {
        const reducer = () => {};
        class SCtl extends Ctl {}

        const module0 = createModule(reducer, SCtl);
        const module1 = createModule(reducer, SCtl);

        expect(module0).not.toBe(module1);
    });

    describe('module.integrator()', () => {
        testAllValues((path, type) => {
            const desc_100 = `should throw an error if single argument "${path}" of type` +
                ` "${type}" is not compatible with path type`;
            it(desc_100, () => {
                class SCtl extends Ctl {}

                const module = createModule(() => {}, SCtl);

                expect(() => {
                    module.integrator(path);
                }).toThrow();
            });
        }, {exclude: [allValuesTypes.STRING, allValuesTypes.ARRAY]});

        it('should throw an error if path is empty string', () => {
            class SCtl extends Ctl {}

            const module = createModule(() => {}, SCtl);

            expect(() => {
                module.integrator('');
            }).toThrow();
        });

        it('should return a function the same as a reducer in the arguments list', () => {
            const reducer = () => {};
            class SCtl extends Ctl {}

            const module = createModule(reducer, SCtl);

            expect(module.integrator('path')).toBe(reducer);
        });
    });

    describe('module.getController()', () => {
        it('should throw an error if called before `module.integrator(path)` is called', () => {
            const reducer = () => {};
            class SCtl extends Ctl {}

            const module = createModule(reducer, SCtl);

            expect(() => {
                module.getController();
            }).toThrow();
        });

        it('should throw an error if ctl class doesn`t have `stateDidUpdate` method', () => {
            const reducer = () => {};
            class SCtl extends Ctl {}

            const module = createModule(reducer, SCtl);

            module.integrator('path');

            expect(() => {
                module.getController();
            }).toThrow();
        });

        it('should return an instance of ctl the same as a ctl in the arguments list', () => {
            const reducer = () => {};
            class SCtl extends Ctl {
                stateDidUpdate() {}
            }

            const module = createModule(reducer, SCtl);

            module.integrator('path');

            expect(module.getController()).toBeInstanceOf(SCtl);
        });
    });

    describe('controller', () => {
        it('should have method `dispatch`', () => {
            const reducer = () => {};
            class SCtl extends Ctl {
                stateDidUpdate() {}
            }

            const module = createModule(reducer, SCtl);

            module.integrator('path');

            const ctl = module.getController();

            expect(ctl.dispatch).toEqual(expect.any(Function));
        });
    });
});
