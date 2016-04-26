const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

const data = require('./data');

module.exports = function transform(code) {
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
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.binaryOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [node.right],
                }
            } else if (node.type === 'LogicalExpression') {
                return {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: node.left,
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
                    arguments: [node.right],
                }
            } else if (node.type === 'AssignmentExpression') {
                return {
                    type: 'AssignmentExpression',
                    left: node.left,
                    operator: '=',
                    right: {
                        type: 'CallExpression',
                        callee: {
                            type: 'MemberExpression',
                            object: JSON.parse(JSON.stringify(node.left)),
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
                        arguments: [node.right],
                    },
                };
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
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.unaryOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [],
                }
            } else if (node.type === 'UpdateExpression') {
                return {
                    type: 'CallExpression',
                    callee: {
                        type: 'MemberExpression',
                        object: node.argument,
                        property: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'Symbol',
                            },
                            property: {
                                type: 'Identifier',
                                name: data.updateOperators[node.operator],
                            },
                        },
                        computed: true,
                    },
                    arguments: [],
                }
            }
        }
    });

    return escodegen.generate(ast);
};
