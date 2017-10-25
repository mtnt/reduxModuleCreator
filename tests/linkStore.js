import {linkStore, unlinkStore} from '../src';

describe('linkStore', () => {
    it('should throw an error if called twice', () => {
        linkStore({});

        expect(() => {
            linkStore({});
        }).toThrow();
    });

    it('should be able to be called again after call the `unlinkStore`', () => {
        linkStore({});

        unlinkStore();

        expect(() => {
            linkStore({});
        }).not.toThrow();
    });
});
