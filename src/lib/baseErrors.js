import ExtendableError from 'es6-error';


export class RMCError extends ExtendableError {
    static domain = 'RMCError';

    constructor(message = '') {
        super(message);

        const domains = [];
        let prototype = this.__proto__;

        do {
            domains.unshift(prototype.constructor.domain);
            prototype = prototype.__proto__;
        } while (prototype.constructor !== ExtendableError);

        this.message = domains.join('.') + (message ? `: ${message}` : '');
    }

    get domain() {
        return this.constructor.domain;
    }
}

export class InvalidParamsError extends RMCError {
    static domain = 'InvalidParams';
}

export class InsufficientDataError extends RMCError {
    static domain = 'InsufficientData';
}

export class WrongInterfaceError extends RMCError {
    static domain = 'WrongInterface';
}

