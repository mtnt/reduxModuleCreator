import {createStore, createModule, Ctl, unlinkStore} from '../src';


const path0 = 'path0';
const path1 = 'path1';
const action0 = 'action0';
const action1 = 'action1';
const payload0 = 'payload0';
const payload1 = 'payload1';
const initialData0 = 'initialData0';
const initialData1 = 'initialData1';

let i = 0;
describe('controller.dispatch', () => {
    describe('when `self` state is changed single time', () => {
        unlinkStore();

        const stateDidUpdate = jest.fn();

        function reducer(state = initialData0, action) {
            switch(action.type) {
                case action0:
                    return action.payload;

                default:
                    return state;
            }
        }
        class SCtl extends Ctl {
            stateDidUpdate = stateDidUpdate;
        }
        const module = createModule(reducer, SCtl);

        function rootReducer(state = {}, action) {
            return {
                [path0]: module.integrator(path0)(state[path0], action),
            };
        }
        createStore(rootReducer);

        const ctl = module.getController();

        ctl.dispatch({type: action0, payload: payload0});

        it('should call `stateDidUpdate`', () => {
            expect.assertions(1);
            expect(stateDidUpdate).toHaveBeenCalled();
        });

        it('should call `stateDidUpdate` with previousState', () => {
            expect.assertions(1);
            expect(stateDidUpdate).toHaveBeenCalledWith(initialData0);
        });

        it('should change private `_state` property to new state', () => {
            expect.assertions(1);
            expect(ctl._state).toBe(payload0);
        })
    });

    describe('when `self` state is changed several time in a line', () => {
        unlinkStore();

        const stateDidUpdate = jest.fn();

        function reducer(state = initialData0, action) {
            switch(action.type) {
                case action0:
                    return action.payload;

                default:
                    return state;
            }
        }
        class SCtl extends Ctl {
            stateDidUpdate = stateDidUpdate;
        }
        const module = createModule(reducer, SCtl);

        function rootReducer(state = {}, action) {
            return {
                [path0]: module.integrator(path0)(state[path0], action),
            };
        }
        createStore(rootReducer);

        const ctl = module.getController();

        ctl.dispatch({type: action0, payload: payload0});
        ctl.dispatch({type: action0, payload: payload1});

        it('should call `stateDidUpdate` each time', () => {
            expect.assertions(1);
            expect(stateDidUpdate).toHaveBeenCalledTimes(2);
        });

        it('should call `stateDidUpdate` with a result of handling a last action', () => {
            expect.assertions(1);
            expect(stateDidUpdate).toHaveBeenLastCalledWith(payload0); // previous state
        });

        it('should change private `_state` property a result of handling a last action', () => {
            expect.assertions(1);
            expect(ctl._state).toBe(payload1);
        });
    });

    describe('when `self` state isn`t changed twice because of actions are identically', () => {
        unlinkStore();

        const stateDidUpdate = jest.fn();

        function reducer(state = initialData0, action) {
            switch(action.type) {
                case action0:
                    return action.payload;

                default:
                    return state;
            }
        }
        class SCtl extends Ctl {
            stateDidUpdate = stateDidUpdate;
        }
        const module = createModule(reducer, SCtl);

        function rootReducer(state = {}, action) {
            return {
                [path0]: module.integrator(path0)(state[path0], action),
            };
        }
        createStore(rootReducer);

        const ctl = module.getController();

        ctl.dispatch({type: action0, payload: payload0});
        ctl.dispatch({type: action0, payload: payload0});

        it('should call `stateDidUpdate` just single time', () => {
            expect.assertions(1);
            expect(stateDidUpdate).toHaveBeenCalledTimes(1);
        });
    });

    describe('when `self` state isn`t changed via `alien` action', () => {
        unlinkStore();

        const stateDidUpdate0 = jest.fn();
        const stateDidUpdate1 = jest.fn();

        function reducer0(state = initialData0, action) {
            switch(action.type) {
                case action0:
                    return action.payload;

                default:
                    return state;
            }
        }
        function reducer1(state = initialData1, action) {
            switch(action.type) {
                case action1:
                    return action.payload;

                default:
                    return state;
            }
        }
        class SCtl0 extends Ctl {
            stateDidUpdate = stateDidUpdate0;
        }
        class SCtl1 extends Ctl {
            stateDidUpdate = stateDidUpdate1;
        }
        const module0 = createModule(reducer0, SCtl0);
        const module1 = createModule(reducer1, SCtl1);

        function rootReducer(state = {}, action) {
            return {
                [path0]: module0.integrator(path0)(state[path0], action),
                [path1]: module1.integrator(path1)(state[path1], action),
            };
        }
        createStore(rootReducer);

        const ctl0 = module0.getController();

        const ctl1 = module1.getController();

        ctl0.dispatch({type: action0, payload: payload0});

        it('should not call `stateDidUpdate` at all', () => {
            expect.assertions(1);
            expect(stateDidUpdate1).toHaveBeenCalledTimes(0);
        });
    });
});
