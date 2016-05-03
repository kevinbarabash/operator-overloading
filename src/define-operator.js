const assert = require('assert');

const prototypes = [];

// key is the index of prototye from prototypes
const prototypeChains = {
    '-1': [],   // id for Object.prototype is -1, it has no prototype
};

const operators = {};

const commutatives = [
    '+', '*', '&&', '||', '&', '|', '^', '==', '!='
];

const computePrototypeChain = function(proto) {
    const chain = [];

    while (proto !== Object.prototype) {
        if (!prototypes.includes(proto)) {
            prototypes.push(proto);
        }
        const index = prototypes.indexOf(proto);
        chain.push(index);

        proto = Object.getPrototypeOf(proto);
    }
    chain.push(-1);

    let [head, ...tail] = chain;
    while (tail.length > 0) {
        prototypeChains[head] = tail;
        [head, ...tail] = tail;
    }
};

const defineBinaryOperator = function(op, types, fn) {
    const [a, b] = types;

    if (typeof a !== 'function' || typeof b !== 'function') {
        throw new Error('Both types must be functions/classes');
    }

    computePrototypeChain(a.prototype);
    computePrototypeChain(b.prototype);

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

    if (typeof a !== 'function') {
        throw new Error('Type must be a function/class');
    }

    computePrototypeChain(a.prototype);

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

            // TODO: calculate the chains upfront so that prototypeChains[-1] = [-1]
            // and so each includes its id as the first element in the array
            const chainA = prototypeChains[aid] ? [aid, ...prototypeChains[aid]]: [-1];
            const chainB = prototypeChains[bid] ? [bid, ...prototypeChains[bid]]: [-1];

            const ids = [];
            for (const i of chainA) {
                for (const j of chainB) {
                    ids.push([i, j]);
                }
            }

            const filteredIds = ids.filter(([i, j]) => operators[op][`${i},${j}`]);

            const chainLengths = filteredIds.map(([i, j]) =>
                Math.max(prototypeChains[i].length, prototypeChains[j].length));

            // class precedence via prototype depth

            let max = -Infinity;
            let maxIndex = -1;
            chainLengths.forEach((length, index) => {
                if (length > max) {
                    max = length;
                    maxIndex = index;
                } else if (length === max) {
                    // we find any lengths that are the same then we opt for a
                    // length where both have the same length
                    // TODO: handle the case where we need to decide between 2,1 and 2,0
                    const [i, j] = filteredIds[index];
                    if (prototypeChains[i].length === length &&
                        prototypeChains[j].length === length) {

                        maxIndex = index;
                    }
                }
            });

            const [i, j] = filteredIds[maxIndex];
            const id = `${i},${j}`;

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
