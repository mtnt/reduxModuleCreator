import {
  DuplicateError,
  InsufficientDataError,
  InvalidParamsError,
  WrongInterfaceError,
  RMCError,
} from '../src/lib/baseErrors';

describe.each([
  ['DuplicateError', new DuplicateError('message')],
  ['InsufficientDataError', new InsufficientDataError('message')],
  ['InvalidParamsError', new InvalidParamsError('message')],
  ['WrongInterfaceError', new WrongInterfaceError('message')],
])('errors, %s', (name, error) => {
  afterEach(() => {});

  it(`${name} should have a name prop`, () => {
    expect(error.name).not.toBeNull();
  });

  it(`${name} should be instance of Error`, () => {
    expect(error).toBeInstanceOf(Error);
  });

  it(`${name} should be instance of RMCError`, () => {
    expect(error).toBeInstanceOf(RMCError);
  });

  it(`${name}\`s message should contain all parents classNames`, () => {
    expect(error.message).toContain(RMCError.name);
    expect(error.message).toContain(error.name);
  });
});
