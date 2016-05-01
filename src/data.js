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
