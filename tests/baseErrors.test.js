import {DuplicateError, RMCError} from '../src/lib/baseErrors';

describe('errors', () => {
  afterEach(() => {});

  it('should be instance of Error', () => {
    expect(new DuplicateError('message')).toBeInstanceOf(Error);
  });

  it('should be instance of RMCError', () => {
    expect(new DuplicateError('message')).toBeInstanceOf(RMCError);
  });

  it('message should contain all parents classNames', () => {
    const error = new DuplicateError('message');

    expect(error.message).toContain(RMCError.name);
    expect(error.message).toContain(DuplicateError.name);
  });
});
