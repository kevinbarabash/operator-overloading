const prototypes = [];
const operators = {};

const commutatives = [
    '+', '*', '&&', '||', '&', '|', '^', '==', '!=', '===', '!=='
];

// TODO: define relational operators in terms of each other
// e.g. if a user defines == using fn(a, b) we should define != as !fn(a, b)

const defineBinaryOperator = function(desc, fn) {
    const [a, op, b] = desc;

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
        operators[op][`${rid},${lid}`] = (a, b) => fn(b, a);
    }
};

const defineUnaryOperator = function(desc, fn) {
    const [op, a] = desc;

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

Function.defineOperator = function(desc, fn) {
    switch (desc.length) {
        case 2:
            defineUnaryOperator(desc, fn);
            break;
        case 3:
            defineBinaryOperator(desc, fn);
            break;
        default:
            throw new Error('invalid descriptor');
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
    strictEquality:     ['===', (a, b) => a === b],
    strictInequality:   ['!==', (a, b) => a !== b],
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
        }
    } else {
        Function[sym] = (a) => {
            const id = prototypes.indexOf(Object.getPrototypeOf(a));
            const fn = operators[op][id] || operators[op]['-1'];
            return fn(a);
        }
    }
});
