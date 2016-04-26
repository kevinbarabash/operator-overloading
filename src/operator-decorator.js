import {
    binaryOperators,
    logicalOperators,
    unaryOperators,
    updateOperators
} from './operator-data';

export default function operator(operator) {
    return function(target, name, descriptor) {
        switch (descriptor.value.length) {
            case 0:
                if (operator in unaryOperators) {
                    const name = unaryOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else if (operator in updateOperators) {
                    const name = updateOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else {
                    throw new Error(`${operator} not a valid unary operator`);
                }
                break;
            case 1:
                if (operator in binaryOperators) {
                    const name = binaryOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else if (operator in logicalOperators) {
                    const name = logicalOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else {
                    throw new Error(`${operator} not a valid operator`);
                }
                break;
            default:
                throw new Error(`@operator accepts at most one argument`);
                break;
        }

    }
};
