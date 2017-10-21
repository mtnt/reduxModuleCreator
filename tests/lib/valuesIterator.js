import {omit, forEach, isNil, difference, keys} from 'lodash';


export const allValuesTypes = {
    STRING: 'string',
    NUMBER: 'number',
    INFINITY: 'infinity',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
    FUNCTION: 'function',
    UNDEFINED: 'undefined',
};

const valuesMap = {
    [allValuesTypes.STRING]: ['foo', '', '0', 'false', 'true'],
    [allValuesTypes.NUMBER]: [-1, 0, 1],
    [allValuesTypes.INFINITY]: [Infinity, -Infinity],
    [allValuesTypes.BOOLEAN]: [true, false],
    [allValuesTypes.ARRAY]: [[], [1, 2, 'foo']],
    [allValuesTypes.OBJECT]: [{}, {foo: 'bar', bar: 'foo'}, null],
    [allValuesTypes.FUNCTION]: [function () {}],
    [allValuesTypes.UNDEFINED]: [undefined],
};

export function testAllValues(func, {exclude, only}) {
    if (!isNil(exclude) && !isNil(only)) {
        throw new Error('TestAllValues got both of `exclude` and `only` arrays');
    }

    if (!isNil(only)) {
        exclude = difference(keys(valuesMap), only);
    } else {
        exclude = exclude || [];
    }

    const values = omit(valuesMap, exclude);

    forEach(values, (value, type) => {
        for (const value of values[type]) {
            func(value, type);
        }
    });
}
