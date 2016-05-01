const data = require('./data');

module.exports = function operator(op, otherType) {
    return function(target, name, desc) {
        const ctor = target.constructor;
        switch (desc.value.length) {
            case 0:
                if (op in data.unaryOperators) {
                    Function.defineOperator(
                        op,
                        [ctor],
                        (a) => desc.value.call(a)
                    );
                } else {
                    throw new Error(`${op} not a valid unary operator`);
                }
                break;
            case 1:
                if (op in data.binaryOperators || op in data.logicalOperators) {
                    Function.defineOperator(
                        op,
                        [ctor, otherType || ctor],
                        (a, b) => desc.value.call(a, b)
                    );
                } else {
                    throw new Error(`${op} not a binary valid operator`);
                }
                break;
            default:
                throw new Error(`@operator accepts at most one argument`);
                break;
        }

    }
};
