import data from './data';

// We don't transform these because we want to preserve their semantics
const prohibitedOperators = [
    'instanceof', '===', '!==',
    'typeof', '!',
];

export default function({ types: t }) {
    return {
        visitor: {

            BinaryExpression(path) {
                const { node } = path;

                if (prohibitedOperators.includes(node.operator)) {
                    return;
                }

                path.replaceWith(
                    t.callExpression(
                        t.memberExpression(
                            t.identifier('Function'),
                            t.memberExpression(
                                t.identifier('Symbol'),
                                t.identifier(data.binaryOperators[node.operator])
                            ),
                            true
                        ),
                        [node.left, node.right]
                    )
                );
            },

            LogicalExpression(path) {
                const { node } = path;

                path.replaceWith(
                    t.callExpression(
                        t.memberExpression(
                            t.identifier('Function'),
                            t.memberExpression(
                                t.identifier('Symbol'),
                                t.identifier(data.logicalOperators[node.operator])
                            ),
                            true
                        ),
                        [node.left, node.right]
                    )
                );
            },

            AssignmentExpression(path) {
                const { node } = path;

                if (node.operator === '=') {
                    return;
                }

                const operator = node.operator.replace('=', '');

                path.replaceWith(
                    t.assignmentExpression(
                        '=',
                        node.left,
                        t.callExpression(
                            t.memberExpression(
                                t.identifier('Function'),
                                t.memberExpression(
                                    t.identifier('Symbol'),
                                    t.identifier(data.binaryOperators[operator])
                                ),
                                true
                            ),
                            [node.left, node.right]
                        )
                    )
                );
            },

            UnaryExpression(path) {
                const { node } = path;

                if (prohibitedOperators.includes(node.operator)) {
                    return;
                }

                path.replaceWith(
                    t.callExpression(
                        t.memberExpression(
                            t.identifier('Function'),
                            t.memberExpression(
                                t.identifier('Symbol'),
                                t.identifier(data.unaryOperators[node.operator])
                            ),
                            true
                        ),
                        [node.argument]
                    )
                )
            }
        }
    };
};
