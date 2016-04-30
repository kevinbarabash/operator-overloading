exports.binaryOperators = {
    '==': 'equality',
    '!=': 'inequality',

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
    '%': 'remainder',
    '**': 'power',

    '|': 'bitwiseOr',
    '^': 'bitwiseXor',
    '&': 'bitwiseAnd',
};

exports.logicalOperators = {
    '||': 'logicalOr',
    '&&': 'logicalAnd',
};

exports.unaryOperators = {
    '+': 'unaryPlus',
    '-': 'unaryMinus',

    '!': 'logicalNot',
    '~': 'bitwiseNot',
};

// TODO: figure out how to differentiate pre/post unary ops
exports.updateOperators = {
    '++': 'increment',
    '--': 'decrement',
};
