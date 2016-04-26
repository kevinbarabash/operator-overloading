import esprima from 'esprima';
import escodegen from 'escodegen';
import estraverse from 'estraverse';

import Vector from './vector';
import SuperSet from './super-set';

console.log('hello, world');

const code = `
const a = new Vector(1, 2, 3);
const b = new Vector(0, 1, -2);

console.log('a + b = ' + (a + b));
console.log('a - b = ' + (a - b));
console.log('-a = ' + -a);
console.log('-b = ' + -b);

const U = new Set([1, 1, 2, 3]);
const V = new Set([3, 5, 8]);

console.log(U | V);
console.log(U & V);
console.log(U - V);
console.log(U ^ V);
console.log(U ^ {});
`;

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

String.prototype[Symbol.plus] = function(other) {
    return this + other;
};

Number.prototype[Symbol.plus] = function(other) {
    return this + other;
};

Number.prototype[Symbol.minus] = function(other) {
    return this - other;
};

Number.prototype[Symbol.unaryMinus] = function() {
    return -this;
};

const ast = esprima.parse(code);

estraverse.replace(ast, {
    leave(node) {
        if (node.type === 'BinaryExpression') {
            return {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: node.left,
                    property: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'Symbol'
                        },
                        property: {
                            type: 'Identifier',
                            name: binaryOperatorNames[node.operator]
                        }
                    },
                    computed: true,
                },
                arguments: [node.right]
            }
        } else if (node.type === 'UnaryExpression') {
            return {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: node.argument,
                    property: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'Symbol'
                        },
                        property: {
                            type: 'Identifier',
                            name: unaryOperatorNames[node.operator]
                        }
                    },
                    computed: true,
                },
                arguments: []
            }
        }
    }
});

const processedCode = escodegen.generate(ast);
const fn = Function('Vector', 'Set', processedCode);

fn(Vector, SuperSet);
