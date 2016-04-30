class Complex {
    constructor(re, im = 0) {
        Object.assign(this, {re, im});
    }

    toString() {
        const {re, im} = this;
        if (im < 0) {
            return `${re} - ${Math.abs(im)}i`;
        } else {
            return `${re} + ${im}i`;
        }
    }
}

// TODO: think about type coercion from Number to Complex

module.exports = Complex;
