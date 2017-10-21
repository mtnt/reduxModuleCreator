import {linkStore} from '../src';

describe('linkStore', () => {
    it('should throw an error if called twice', () => {
        linkStore({});

        expect(() => {
            linkStore({});
        }).toThrow();
    });
});
