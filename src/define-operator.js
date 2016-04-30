const assert = require('assert');

const prototypes = [];
const operators = {};

const commutatives = [
    '+', '*', '&&', '||', '&', '|', '^', '==', '!='
];

// TODO: define relational operators in terms of each other
// e.g. if a user defines == using fn(a, b) we should define != as !fn(a, b)

const defineBinaryOperator = function(op, types, fn) {
    const [a, b] = types;

    const aProto = a.prototype;
    const bProto = b.prototype;

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    if (!prototypes.includes(bProto)) {
        prototypes.push(bProto);
    }

    const lid = prototypes.indexOf(aProto);
    const rid = prototypes.indexOf(bProto);
    const id = `${lid},${rid}`;

    if (!operators.hasOwnProperty(op)) {
        operators[op] = {};
    }

    operators[op][id] = fn;

    // handle commutative operations automatically
    if (commutatives.includes(op) && a !== b) {
        // reverse the arguments so that we can deal with any special cases
        // involving types that aren't the same
        operators[op][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '<') {
        if (!operators.hasOwnProperty('>')) {
            operators['>'] = {};
        }
        operators['>'][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '<=') {
        if (!operators.hasOwnProperty('>=')) {
            operators['>='] = {};
        }
        operators['>='][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '==') {
        if (!operators.hasOwnProperty('!=')) {
            operators['!='] = {};
        }
        operators['!='][`${lid},${rid}`] = (a, b) => !fn(a, b);
        operators['!='][`${rid},${lid}`] = (a, b) => !fn(b, a);
    }
};

const defineUnaryOperator = function(op, types, fn) {
    const [a] = types;

    const aProto = a.prototype;

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    const id = prototypes.indexOf(aProto);

    if (!operators.hasOwnProperty(op)) {
        operators[op] = {};
    }

    operators[op][id] = fn;
};

const allowedOperators = [
    '|', '^', '&', '~',
    '==', '<', '<=',
    '<<', '>>', '>>>',
    '+', '-', '*', '/', '%'
];

Function.defineOperator = function(desc, fn) {
    const op = desc.operator;

    if (!allowedOperators.includes(op)) {
        throw new Error(`'${op}' cannot be overloaded`);
    }

    if (desc.type === 'BinaryOperator') {
        assert(fn.length === 2,
            `function takes ${fn.length} params but should take 2`);
        return defineBinaryOperator(op, [desc.left, desc.right], fn);
    } else if (desc.type === 'UnaryOperator') {
        assert(fn.length === 1,
            `function takes ${fn.length} params but should take 1`);
        return defineUnaryOperator(op, [desc.argument], fn);
    }
};

const operatorData = {
    plus:               ['+',   (a, b) => a + b],
    minus:              ['-',   (a, b) => a - b],
    times:              ['*',   (a, b) => a * b],
    divide:             ['/',   (a, b) => a / b],
    remainder:          ['%',   (a, b) => a / b],
    unaryPlus:          ['+',   (a) => +a],
    unaryMinus:         ['-',   (a) => -a],

    equality:           ['==',  (a, b) => a == b],
    inequality:         ['!=',  (a, b) => a != b],
    lessThan:           ['<',   (a, b) => a !== b],
    lessThanOrEqual:    ['<=',  (a, b) => a !== b],
    greaterThan:        ['>',   (a, b) => a !== b],
    greaterThanOrEqual: ['>=',  (a, b) => a !== b],

    shiftLeft:          ['<<',  (a, b) => a << b],
    shiftRight:         ['>>',  (a, b) => a >> b],
    unsignedShiftRight: ['>>>', (a, b) => a >>> b],
    bitwiseOr:          ['|',   (a, b) => a | b],
    bitwiseAnd:         ['&',   (a, b) => a & b],
    bitwiseXor:         ['^',   (a, b) => a ^ b],
    bitwiseNot:         ['~',   (a) => ~a],

    logicalOr:          ['||',  (a, b) => a || b],
    logicalAnd:         ['&&',  (a, b) => a && b],
    logicalNot:         ['!',   (a) => !a],
};

Object.keys(operatorData).forEach(name => {
    const op = operatorData[name][0];
    const fn = operatorData[name][1];

    const id = fn.length === 2 ? '-1,-1' : '-1';

    if (!operators[op]) {
        operators[op] = {};
    }
    operators[op][id] = fn;

    const sym = Symbol[name] = Symbol(name);

    if (fn.length === 2) {
        Function[sym] = (a, b) => {
            const aid = prototypes.indexOf(Object.getPrototypeOf(a));
            const bid = prototypes.indexOf(Object.getPrototypeOf(b));
            const fn = operators[op][`${aid},${bid}`] || operators[op]['-1,-1'];
            return fn(a, b);
        };
        if (allowedOperators.includes(op)) {
g            Function.defineOperator({
                type: 'BinaryOperator',
                left: Function,
                operator: op,
                right: Function,
            }, (A, B) => {
                return {
                    type: 'BinaryOperator',
                    left: A,
                    operator: op,
                    right: B,
                };
            });
        }
    } else {
        Function[sym] = (a) => {
            const id = prototypes.indexOf(Object.getPrototypeOf(a));
            const fn = operators[op][id] || operators[op]['-1'];
            return fn(a);
        };
        if (allowedOperators.includes(op)) {
            Function.defineOperator({
                type: 'UnaryOperator',
                operator: op,
                argument: Function,
            }, (B) => {
                return {
                    type: 'UnaryOperator',
                    operator: op,
                    argument: B,
                };
            });
        }
    }
});
