'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var assert = require('assert');

var prototypes = [Object.prototype, String.prototype, Number.prototype];

// key is the index of prototye from prototypes
var prototypeChains = {
    '0': ['0'],
    '1': ['1', '0'],
    '2': ['2', '0']
};

var operators = {
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
    '&&': {}
};

var commutatives = ['+', '*', '&&', '||', '&', '|', '^', '==', '!='];

// TODO: check if we already have a prototype chain for this prototype
var computePrototypeChain = function computePrototypeChain(proto) {
    var chain = [];

    while (proto !== null) {
        if (!prototypes.includes(proto)) {
            prototypes.push(proto);
        }
        var index = prototypes.indexOf(proto);
        chain.push(index);

        proto = Object.getPrototypeOf(proto);
    }

    while (chain.length > 0) {
        prototypeChains[chain[0]] = chain;
        chain = chain.slice(1);
    }
};

var defineBinaryOperator = function defineBinaryOperator(op, types, fn) {
    var _types = _slicedToArray(types, 2);

    var a = _types[0];
    var b = _types[1];


    if (typeof a !== 'function' || typeof b !== 'function') {
        throw new Error('Both types must be functions/classes');
    }

    var aProto = a.prototype;
    var bProto = b.prototype;

    if (aProto === Number.prototype && bProto === Number.prototype) {
        throw new Error('redefining \'' + op + '\' for [Number, Number] is prohibited');
    }

    if (aProto === Boolean.prototype && bProto === Boolean.prototype) {
        if (['||', '&&'].includes(op)) {
            throw new Error('redefining \'' + op + '\' for [Boolean, Boolean] is prohibited');
        }
    }

    if (op === '+' && aProto === String.prototype && bProto === String.prototype) {
        throw new Error('redefining \'+\' for [String, String] is prohibited');
    }

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    if (!prototypes.includes(bProto)) {
        prototypes.push(bProto);
    }

    var aid = prototypes.indexOf(aProto);
    if (!prototypeChains.hasOwnProperty(aid)) {
        computePrototypeChain(aProto);
    }

    var bid = prototypes.indexOf(bProto);
    if (!prototypeChains.hasOwnProperty(bid)) {
        computePrototypeChain(bProto);
    }

    var id = aid + ',' + bid;

    operators[op][id] = fn;

    // handle commutative operations automatically
    if (commutatives.includes(op) && a !== b) {
        // reverse the arguments so that we can deal with any special cases
        // involving types that aren't the same
        operators[op][bid + ',' + aid] = function (a, b) {
            return fn(b, a);
        };
    } else if (op === '<') {
        operators['>'][bid + ',' + aid] = function (a, b) {
            return fn(b, a);
        };
    } else if (op === '<=') {
        operators['>='][bid + ',' + aid] = function (a, b) {
            return fn(b, a);
        };
    } else if (op === '==') {
        operators['!='][aid + ',' + bid] = function (a, b) {
            return !fn(a, b);
        };
        operators['!='][bid + ',' + aid] = function (a, b) {
            return !fn(b, a);
        };
    }
};

var defineUnaryOperator = function defineUnaryOperator(op, types, fn) {
    var _types2 = _slicedToArray(types, 1);

    var a = _types2[0];


    if (typeof a !== 'function') {
        throw new Error('Type must be a function/class');
    }

    var aProto = a.prototype;

    if (aProto === Number.prototype) {
        throw new Error('redefining \'' + op + '\' for [Number] is prohibited');
    }

    if (!prototypes.includes(aProto)) {
        prototypes.push(aProto);
    }

    var id = prototypes.indexOf(aProto);

    if (!prototypeChains.hasOwnProperty(id)) {
        computePrototypeChain(aProto);
    }

    operators[op][id] = fn;
};

var allowedOperators = ['|', '^', '&', '~', '==', '<', '<=', '<<', '>>', '>>>', '+', '-', '*', '/', '%'];

Function.defineOperator = function (op, types, fn) {
    if (!allowedOperators.includes(op)) {
        throw new Error('\'' + op + '\' cannot be overloaded');
    }

    if (types.length === 2) {
        assert(fn.length === 2, 'function takes ' + fn.length + ' params but should take 2');
        return defineBinaryOperator(op, types, fn);
    } else if (types.length === 1) {
        assert(fn.length === 1, 'function takes ' + fn.length + ' params but should take 1');
        return defineUnaryOperator(op, types, fn);
    }
};

var operatorData = {
    plus: ['+', function (a, b) {
        return a + b;
    }],
    minus: ['-', function (a, b) {
        return a - b;
    }],
    times: ['*', function (a, b) {
        return a * b;
    }],
    divide: ['/', function (a, b) {
        return a / b;
    }],
    remainder: ['%', function (a, b) {
        return a / b;
    }],
    unaryPlus: ['+', function (a) {
        return +a;
    }],
    unaryMinus: ['-', function (a) {
        return -a;
    }],

    equality: ['==', function (a, b) {
        return a == b;
    }],
    inequality: ['!=', function (a, b) {
        return a != b;
    }],
    lessThan: ['<', function (a, b) {
        return a !== b;
    }],
    lessThanOrEqual: ['<=', function (a, b) {
        return a !== b;
    }],
    greaterThan: ['>', function (a, b) {
        return a !== b;
    }],
    greaterThanOrEqual: ['>=', function (a, b) {
        return a !== b;
    }],

    shiftLeft: ['<<', function (a, b) {
        return a << b;
    }],
    shiftRight: ['>>', function (a, b) {
        return a >> b;
    }],
    unsignedShiftRight: ['>>>', function (a, b) {
        return a >>> b;
    }],
    bitwiseOr: ['|', function (a, b) {
        return a | b;
    }],
    bitwiseAnd: ['&', function (a, b) {
        return a & b;
    }],
    bitwiseXor: ['^', function (a, b) {
        return a ^ b;
    }],
    bitwiseNot: ['~', function (a) {
        return ~a;
    }],

    logicalOr: ['||', function (a, b) {
        return a || b;
    }],
    logicalAnd: ['&&', function (a, b) {
        return a && b;
    }]
};

Object.keys(operatorData).forEach(function (name) {
    var op = operatorData[name][0];
    var fn = operatorData[name][1];

    var id = fn.length === 2 ? '0,0' : '0';
    operators[op][id] = fn;

    var sym = Symbol[name] = Symbol(name);
    var objProto = Object.prototype;

    if (fn.length === 2) {
        Function[sym] = function (a, b) {
            var aProto = void 0,
                bProto = void 0;

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

            var aid = a == null ? 0 : prototypes.indexOf(aProto);
            var bid = b == null ? 0 : prototypes.indexOf(bProto);

            // optimize for an exact match of the operand prototypes
            var fastId = aid + ',' + bid;
            if (operators[op][fastId]) {
                var _fn = operators[op][fastId];
                return _fn(a, b);
            }

            // We copy the prototype chains so that we don't modify them.
            var chainA = [].concat(_toConsumableArray(prototypeChains[aid]));
            var chainB = [].concat(_toConsumableArray(prototypeChains[bid]));

            var ids = [];

            // TODO: if the operator is commutative we can simplify this a bit
            while (chainA.length > 1 && chainB.length > 1) {
                if (chainA.length > chainB.length) {
                    ids.push.apply(ids, _toConsumableArray(chainA.map(function (id) {
                        return id + ',' + chainB[0];
                    })));
                    chainA.shift();
                } else if (chainB.length > chainA.length) {
                    ids.push.apply(ids, _toConsumableArray(chainB.map(function (id) {
                        return chainA[0] + ',' + id;
                    })));
                    chainB.shift();
                } else {
                    ids.push(chainA[0] + ',' + chainB[0]);
                    // Ensure the the sum of the chain lengths of each pair of
                    // prototype chains is monotonically decrease.
                    for (var i = 1; i < chainA.length; i++) {
                        ids.push(chainA[0] + ',' + chainB[i]);
                        ids.push(chainA[i] + ',' + chainB[0]);
                    }
                    chainA.shift();
                    chainB.shift();
                }
            }

            // base case
            ids.push('0,0');

            var id = ids.find(function (id) {
                return operators[op][id];
            });

            var fn = operators[op][id];
            return fn(a, b);
        };
    } else {
        Function[sym] = function (a) {
            if (a != null) {
                var aProto = Object.getPrototypeOf(a);
                if (aProto !== objProto && !prototypes.includes(aProto)) {
                    computePrototypeChain(aProto);
                }
            }

            var aid = prototypes.indexOf(Object.getPrototypeOf(a));
            var id = prototypeChains[aid].find(function (id) {
                return operators[op][id];
            });

            var fn = operators[op][id];
            return fn(a);
        };
    }
});