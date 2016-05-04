const assert = require('assert');

const prototypes = [];

// key is the index of prototye from prototypes
const prototypeChains = {
    '-1': ['-1'],   // id for Object.prototype is -1, it has no prototype
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

const computePrototypeChain = function(proto) {
    let chain = [];

    while (proto !== Object.prototype) {
        if (!prototypes.includes(proto)) {
            prototypes.push(proto);
        }
        const index = prototypes.indexOf(proto);
        chain.push(index);

        proto = Object.getPrototypeOf(proto);
    }
    chain.push(-1);

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

    computePrototypeChain(aProto);
    computePrototypeChain(bProto);

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    if (!prototypes.includes(bProto)) {
        prototypes.push(bProto);
    }

    const lid = prototypes.indexOf(aProto);
    const rid = prototypes.indexOf(bProto);
    const id = `${lid},${rid}`;

    operators[op][id] = fn;

    // handle commutative operations automatically
    if (commutatives.includes(op) && a !== b) {
        // reverse the arguments so that we can deal with any special cases
        // involving types that aren't the same
        operators[op][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '<') {
        operators['>'][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '<=') {
        operators['>='][`${rid},${lid}`] = (a, b) => fn(b, a);
    } else if (op === '==') {
        operators['!='][`${lid},${rid}`] = (a, b) => !fn(a, b);
        operators['!='][`${rid},${lid}`] = (a, b) => !fn(b, a);
    }
};

const defineUnaryOperator = function(op, types, fn) {
    const [a] = types;

    if (typeof a !== 'function') {
        throw new Error('Type must be a function/class');
    }

    const aProto = a.prototype;
    computePrototypeChain(aProto);

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    const id = prototypes.indexOf(aProto);

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

    const id = fn.length === 2 ? '-1,-1' : '-1';
    operators[op][id] = fn;

    const sym = Symbol[name] = Symbol(name);

    if (fn.length === 2) {
        Function[sym] = (a, b) => {
            const aid = prototypes.indexOf(Object.getPrototypeOf(a));
            const bid = prototypes.indexOf(Object.getPrototypeOf(b));

            // TODO: calculate the chains upfront so that prototypeChains[-1] = [-1]
            // and so each includes its id as the first element in the array
            const chainA = prototypeChains[aid];
            const chainB = prototypeChains[bid];

            // optimize for an exact match of the operand prototypes
            const fastId = `${chainA[0]},${chainB[0]}`;
            if (operators[op][fastId]) {
                const fn = operators[op][fastId];
                return fn(a, b);
            }

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
            ids.push('-1,-1');

            const id = ids.find(id => operators[op][id]);

            const fn = operators[op][id];
            return fn(a, b);
        };
    } else {
        Function[sym] = (a) => {
            const aid = prototypes.indexOf(Object.getPrototypeOf(a));

            const chainA = prototypeChains[aid] ? [aid, ...prototypeChains[aid]]: [-1];

            const id = chainA.find(id => operators[op][id]);

            const fn = operators[op][id];
            return fn(a);
        };
    }
});
