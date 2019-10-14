import {linkStore, unlinkStore} from '../src';
import {DuplicateError, InsufficientDataError} from '../src/lib/baseErrors';

describe('linkStore', () => {
  afterEach(() => {
    unlinkStore();
  });

  it('should throw an error if called twice', () => {
    linkStore({});

    expect(() => {
      linkStore({});
    }).toThrow(DuplicateError);
  });

  it('should be ok after unlink store', () => {
    linkStore({});
    unlinkStore();

    expect(() => {
      linkStore({});
    }).not.toThrow();
  });
});

describe('unlinkStore', () => {
  it('should throw an error if unlink before link', () => {
    expect(() => {
      unlinkStore();
    }).toThrow(InsufficientDataError);
  });
});
