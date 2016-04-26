const data = require('./data');

module.exports = function operator(operator) {
    return function(target, name, descriptor) {
        switch (descriptor.value.length) {
            case 0:
                if (operator in data.unaryOperators) {
                    const name = data.unaryOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else if (operator in data.updateOperators) {
                    const name = data.updateOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else {
                    throw new Error(`${operator} not a valid unary operator`);
                }
                break;
            case 1:
                if (operator in data.binaryOperators) {
                    const name = data.binaryOperators[operator];
                    target[Symbol[name]] = descriptor.value;
                } else if (operator in data.logicalOperators) {
                    const name = data.logicalOperators[operator];
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
