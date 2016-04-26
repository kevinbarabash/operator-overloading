const binaryOperatorNames = {
    '+': 'plus',
    '-': 'minus',
    '*': 'times',
    '/': 'divide',
    '%': 'modulo',
    '**': 'exp',

    '>': 'gt',
    '>=': 'geq',
    '<': 'lt',
    '<=': 'leq',
    '==': 'eqeq',
    '===': 'eqeqeq',
    '!=': 'neq',
    '!==': 'neqeq',

    '^': 'caret',
    '|': 'pipe',
    '~': 'tilde',
    '&': 'ampersand',

    '||': 'or',
    '&&': 'and',
};

// these are similar to binary operators
const assignmentOperatorNames = {
    '+=': 'plusAssign',
    '-=': 'minusAssign',
    '*=': 'timesAssign',
    '/=': 'divideAssign',
};

const unaryOperatorNames = {
    '+': 'unaryPlus',
    '-': 'unaryMinus',

    // TODO: figure out how to differentiate pre/post unary ops
    '++': 'increment',
    '--': 'decrement',

    '!': 'bang',
    '~': 'tilde',
};

for (const name of Object.values(binaryOperatorNames)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(unaryOperatorNames)) {
    Symbol[name] = Symbol(name);
}


const operator = function(operator) {
    return function(target, name, descriptor) {
        switch (descriptor.value.length) {
            case 0:
                if (operator in unaryOperatorNames) {
                    const operatorName = unaryOperatorNames[operator];
                    target[Symbol[operatorName]] = descriptor.value;
                } else {
                    throw new Error(`${operator} not a valid unary operator`);
                }
                break;
            case 1:
                if (operator in binaryOperatorNames) {
                    const operatorName = binaryOperatorNames[operator];
                    target[Symbol[operatorName]] = descriptor.value;
                } else {
                    throw new Error(`${operator} not a valid unary operator`);
                }
                break;
            default:
                throw new Error(`@operator accepts at most one argument`);
                break;
        }

    }
};

export {
    operator as default
};
