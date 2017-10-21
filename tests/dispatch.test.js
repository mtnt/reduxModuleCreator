import {createStore, createModule, Ctl} from '../src';

import {allValuesTypes, testAllValues} from './lib';


const collection = [
    {
        path: 'path0',
        actionType: 'action0',
        payload: 'somePayload0',
        stateDidUpdate: jest.fn(),
    },
    {
        path: 'path1',
        actionType: 'action1',
        payload0: 'somePayload1',
        payload1: 'somePayload2',
        stateDidUpdate: jest.fn(),
    },
    {
        path: 'path2',
        actionType: 'action2',
        payload: 'somePayload3',
        stateDidUpdate: jest.fn(),
    },
    {
        path: 'path3',
        actionType: 'action3',
        payload: 'somePayload4',
        stateDidUpdate: jest.fn(),
    },
    {
        path: 'path4',
        actionType: 'action4',
        payload: 'somePayload5',
        stateDidUpdate: jest.fn(),
    },
];

collection[0].reducer = (state = 0, action) => {
    switch(action.type) {
        case collection[0].actionType:
            return action.payload;

        default:
            return state;
    }
};
collection[0].controllerClass = class extends Ctl {
    stateDidUpdate = collection[0].stateDidUpdate;
};
collection[0].module = createModule(collection[0].reducer, collection[0].controllerClass);


collection[1].reducer = (state = 0, action) => {
    switch(action.type) {
        case collection[1].actionType:
            return action.payload;

        default:
            return state;
    }
};
collection[1].controllerClass = class extends Ctl {
    stateDidUpdate = collection[1].stateDidUpdate;
};
collection[1].module = createModule(collection[1].reducer, collection[1].controllerClass);

collection[2].reducer = (state = 0, action) => {
    switch(action.type) {
        case collection[2].actionType:
            return action.payload;

        default:
            return state;
    }
};
collection[2].controllerClass = class extends Ctl {
    stateDidUpdate = collection[2].stateDidUpdate;
};
collection[2].module = createModule(collection[2].reducer, collection[2].controllerClass);

collection[3].reducer = (state = 0, action) => {
    switch(action.type) {
        case collection[3].actionType:
            return action.payload;

        default:
            return state;
    }
};
collection[4].reducer = (state = 0, action) => {
    switch(action.type) {
        case collection[4].actionType:
            return action.payload;

        default:
            return state;
    }
};
collection[3].controllerClass = class extends Ctl {
    stateDidUpdate = collection[3].stateDidUpdate;
};
collection[4].controllerClass = class extends Ctl {
    stateDidUpdate = collection[4].stateDidUpdate;
};
collection[3].module = createModule(collection[3].reducer, collection[3].controllerClass);
collection[4].module = createModule(collection[4].reducer, collection[4].controllerClass);


function rootReducer(state = {}, action) {
    const nextState = {};

    for (let set of collection) {
        nextState[set.path] = set.module.integrator(set.path)(state[set.path], action);
    }

    return nextState;
}

createStore(rootReducer);

describe('controller.dispatch', () => {
    it('should call `stateDidUpdate` when `self` state is changed', () => {
        const {payload, actionType: type, stateDidUpdate, module} = collection[0];
        const ctl = module.getController();

        ctl.dispatch({type, payload});

        expect.assertions(2);
        expect(stateDidUpdate).toHaveBeenCalledTimes(1);
        expect(stateDidUpdate).toHaveBeenCalledWith(payload);
    });

    it('should call `stateDidUpdate` each time when `self` state is changed', () => {
        const {payload0, payload1, actionType: type, stateDidUpdate, module} = collection[1];
        const ctl = module.getController();

        ctl.dispatch({type, payload: payload0});
        ctl.dispatch({type, payload: payload1});

        expect.assertions(2);
        expect(stateDidUpdate).toHaveBeenCalledTimes(2);
        expect(stateDidUpdate).toHaveBeenLastCalledWith(payload1);
    });

    let desc_100 = 'shouldn`t call `stateDidUpdate` when `self` state isn`t changed on the' +
        ' same action';
    it(desc_100, () => {
        const {payload, actionType: type, stateDidUpdate, module} = collection[2];
        const ctl = module.getController();

        ctl.dispatch({type, payload: payload});
        ctl.dispatch({type, payload: payload});

        expect.assertions(2);
        expect(stateDidUpdate).toHaveBeenCalledTimes(1);
        expect(stateDidUpdate).toHaveBeenCalledWith(payload);
    });

    it('should not call `stateDidUpdate` when `not self` state is changed', () => {
        const {payload, actionType: type, module} = collection[3];
        const {stateDidUpdate} = collection[4];

        const ctl = module.getController();

        ctl.dispatch({type, payload: payload});

        expect.assertions(1);
        expect(stateDidUpdate).toHaveBeenCalledTimes(0);
    });
});
