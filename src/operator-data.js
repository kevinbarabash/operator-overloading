export const binaryOperators = {
    '==': 'equality',
    '!=': 'inequality',
    '===': 'strictEquality',
    '!==': 'strictInequality',

    '<': 'lessThan',
    '<=': 'lessThanOrEqual',
    '>': 'greaterThan',
    '>=': 'greaterThanOrEqual',

    '<<': 'shiftLeft',
    '>>': 'shiftRight',
    '>>>': 'unsignedShiftRight',

    '+': 'plus',
    '-': 'minus',
    '*': 'times',
    '/': 'divide',
    '%': 'modulo',
    '**': 'power',

    '|': 'bitwiseOr',
    '^': 'bitwiseXor',
    '&': 'bitwiseAnd',
};

export const logicalOperators = {
    '||': 'logicalOr',
    '&&': 'logicalAnd',
};

export const unaryOperators = {
    '+': 'unaryPlus',
    '-': 'unaryMinus',

    '!': 'logicalNot',
    '~': 'bitwiseNot',
};

// TODO: figure out how to differentiate pre/post unary ops
export const updateOperators = {
    '++': 'increment',
    '--': 'decrement',
};
