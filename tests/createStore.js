import {createStore} from '../src';

describe('createStore', () => {
    it('should throw an error if called twice', () => {
        createStore(() => {});
        expect(() => {
            console.log('foo');
            createStore(() => {});
        }).toThrow();
    });
});
