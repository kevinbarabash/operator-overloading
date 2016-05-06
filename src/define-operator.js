'use strict';

const assert = require('assert');

const prototypes = [
    Object.prototype, String.prototype, Number.prototype,
];

// key is the index of prototye from prototypes
const prototypeChains = {
    '0': ['0'],
    '1': ['1', '0'],
    '2': ['2', '0'],
};

const operators = {
    '+': {},
    '-': {},
    '*': {},
    '/': {},
    '%': {},
    '==': {},
    '!=': {},
    '<': {},
    '<=': {},
    '>': {},
    '>=': {},
    '<<': {},
    '>>': {},
    '>>>': {},
    '|': {},
    '&': {},
    '^': {},
    '~': {},
    '||': {},
    '&&': {},
};

const commutatives = [
    '+', '*', '&&', '||', '&', '|', '^', '==', '!='
];

// TODO: check if we already have a prototype chain for this prototype
const computePrototypeChain = function(proto) {
    let chain = [];

    while (proto !== null) {
        if (!prototypes.includes(proto)) {
            prototypes.push(proto);
        }
        const index = prototypes.indexOf(proto);
        chain.push(index);

        proto = Object.getPrototypeOf(proto);
    }

    while (chain.length > 0) {
        prototypeChains[chain[0]] = chain;
        chain = chain.slice(1);
    }
};

const defineBinaryOperator = function(op, types, fn) {
    const [a, b] = types;

    if (typeof a !== 'function' || typeof b !== 'function') {
        throw new Error('Both types must be functions/classes');
    }

    const aProto = a.prototype;
    const bProto = b.prototype;

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    if (!prototypes.includes(bProto)) {
        prototypes.push(bProto);
    }

    const aid = prototypes.indexOf(aProto);
    if (!prototypeChains.hasOwnProperty(aid)) {
        computePrototypeChain(aProto);
    }

    const bid = prototypes.indexOf(bProto);
    if (!prototypeChains.hasOwnProperty(bid)) {
        computePrototypeChain(bProto);
    }

    const id = `${aid},${bid}`;

    operators[op][id] = fn;

    // handle commutative operations automatically
    if (commutatives.includes(op) && a !== b) {
        // reverse the arguments so that we can deal with any special cases
        // involving types that aren't the same
        operators[op][`${bid},${aid}`] = (a, b) => fn(b, a);
    } else if (op === '<') {
        operators['>'][`${bid},${aid}`] = (a, b) => fn(b, a);
    } else if (op === '<=') {
        operators['>='][`${bid},${aid}`] = (a, b) => fn(b, a);
    } else if (op === '==') {
        operators['!='][`${aid},${bid}`] = (a, b) => !fn(a, b);
        operators['!='][`${bid},${aid}`] = (a, b) => !fn(b, a);
    }
};

const defineUnaryOperator = function(op, types, fn) {
    const [a] = types;

    if (typeof a !== 'function') {
        throw new Error('Type must be a function/class');
    }

    const aProto = a.prototype;

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    const id = prototypes.indexOf(aProto);

    if (!prototypeChains.hasOwnProperty(id)) {
        computePrototypeChain(aProto);
    }

    operators[op][id] = fn;
};

const allowedOperators = [
    '|', '^', '&', '~',
    '==', '<', '<=',
    '<<', '>>', '>>>',
    '+', '-', '*', '/', '%'
];

Function.defineOperator = function(op, types, fn) {
    if (!allowedOperators.includes(op)) {
        throw new Error(`'${op}' cannot be overloaded`);
    }

    if (types.length === 2) {
        assert(fn.length === 2,
            `function takes ${fn.length} params but should take 2`);
        return defineBinaryOperator(op, types, fn);
    } else if (types.length === 1) {
        assert(fn.length === 1,
            `function takes ${fn.length} params but should take 1`);
        return defineUnaryOperator(op, types, fn);
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
};

Object.keys(operatorData).forEach(name => {
    const op = operatorData[name][0];
    const fn = operatorData[name][1];

    const id = fn.length === 2 ? '0,0' : '0';
    operators[op][id] = fn;

    const sym = Symbol[name] = Symbol(name);
    const objProto = Object.prototype;

    if (fn.length === 2) {
        Function[sym] = (a, b) => {
            let aProto, bProto;

            if (a != null) {
                aProto = Object.getPrototypeOf(a);
                if (aProto !== objProto && !prototypes.includes(aProto)) {
                    computePrototypeChain(aProto);
                }
            }

            if (b != null) {
                bProto = Object.getPrototypeOf(b);
                if (bProto !== objProto && !prototypes.includes(bProto)) {
                    computePrototypeChain(bProto);
                }
            }

            const aid = a == null ? 0 : prototypes.indexOf(aProto);
            const bid = b == null ? 0 : prototypes.indexOf(bProto);

            // optimize for an exact match of the operand prototypes
            const fastId = `${aid},${bid}`;
            if (operators[op][fastId]) {
                const fn = operators[op][fastId];
                return fn(a, b);
            }

            // We copy the prototype chains so that we don't modify them.
            const chainA = [...prototypeChains[aid]];
            const chainB = [...prototypeChains[bid]];

            const ids = [];

            // TODO: if the operator is commutative we can simplify this a bit
            while (chainA.length > 1 && chainB.length > 1) {
                if (chainA.length > chainB.length) {
                    ids.push(...chainA.map(id => `${id},${chainB[0]}`));
                    chainA.shift();
                } else if (chainB.length > chainA.length) {
                    ids.push(...chainB.map(id => `${chainA[0]},${id}`));
                    chainB.shift();
                } else {
                    ids.push(`${chainA[0]},${chainB[0]}`);
                    // Ensure the the sum of the chain lengths of each pair of
                    // prototype chains is monotonically decrease.
                    for (var i = 1; i < chainA.length; i++) {
                        ids.push(`${chainA[0]},${chainB[i]}`);
                        ids.push(`${chainA[i]},${chainB[0]}`);
                    }
                    chainA.shift();
                    chainB.shift();
                }
            }

            // base case
            ids.push('0,0');

            const id = ids.find(id => operators[op][id]);

            const fn = operators[op][id];
            return fn(a, b);
        };
    } else {
        Function[sym] = (a) => {
            if (a != null) {
                const aProto = Object.getPrototypeOf(a);
                if (aProto !== objProto && !prototypes.includes(aProto)) {
                    computePrototypeChain(aProto);
                }
            }

            const aid = prototypes.indexOf(Object.getPrototypeOf(a));
            const id = prototypeChains[aid].find(id => operators[op][id]);

            const fn = operators[op][id];
            return fn(a);
        };
    }
});
