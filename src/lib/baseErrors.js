import ExtendableError from 'es6-error';

export class RMCError extends ExtendableError {
  constructor(message = '') {
    super(message);

    const domains = [];
    let prototype = this.__proto__;

    do {
      domains.push(prototype.constructor.name);
      prototype = prototype.__proto__;
    } while (prototype.constructor !== ExtendableError);

    this.message = domains.join('.') + (message ? `: ${message}` : '');
  }
}

export class InvalidParamsError extends RMCError {}

export class InsufficientDataError extends RMCError {}

export class WrongInterfaceError extends RMCError {}

export class DuplicateError extends RMCError {}
