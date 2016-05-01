const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

const data = require('./data');

module.exports = function transform(code) {
    const ast = esprima.parse(code);

    estraverse.replace(ast, {
        enter(node) {
            // TODO: track entering/leaving function/method bodies
            // check whether there's a 'use overloading'
        },
        leave(node) {
            if (node.type === 'BinaryExpression') {
                // TODO: exclude all binary operators we don't handle
                if (node.operator === 'instanceof') {
                    return;
                }
                return {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'Function',
                        },
                        property: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.binaryOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [node.left, node.right],
                }
            } else if (node.type === 'LogicalExpression') {
                return {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'Function',
                        },
                        property: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.logicalOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [node.left, node.right],
                }
            } else if (node.type === 'AssignmentExpression') {
                if (node.operator === '=') {
                    return;
                }
                return {
                    type: 'AssignmentExpression',
                    left: JSON.parse(JSON.stringify(node.left)),
                    operator: '=',
                    right: {
                        type: 'CallExpression',
                        callee: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'Function',
                            },
                            property: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'Symbol',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: data.binaryOperators[node.operator.replace('=', '')],
                                },
                            },
                            computed: true,
                        },
                        arguments: [node.left, node.right],
                    },
                };
            } else if (node.type === 'UnaryExpression') {
                // TODO: exclude all unary operators we don't handle
                if (node.operator === 'typeof') {
                    return;
                }
                return {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'Function',
                        },
                        property: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.unaryOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [node.argument],
                }
            }
        }
    });

    return escodegen.generate(ast);
};
