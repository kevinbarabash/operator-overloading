import data from './data';

export default function({ types: t }) {
    return {
        visitor: {

            BinaryExpression(path) {
                const { node } = path;

                if (node.operator === 'instanceof') {
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

                path.replaceWith(
                    t.assignmentExpression(
                        '=',
                        node.left,
                        t.callExpression(
                            t.memberExpression(
                                t.identifier('Function'),
                                t.memberExpression(
                                    t.identifier('Symbol'),
                                    t.identifier(data.binaryOperators[node.operator.replace('=', '')])
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

                if (node.operator === 'typeof') {
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
