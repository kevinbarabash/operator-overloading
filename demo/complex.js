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

Function.defineOperator('+', [Complex, Complex],
    (a, b) => new Complex(a.re + b.re, a.im + b.im));
Function.defineOperator('-', [Complex, Complex],
    (a, b) => new Complex(a.re - b.re, a.im - b.im));
Function.defineOperator('*', [Complex, Complex],
    (a, b) => new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re));
Function.defineOperator('+', [Number, Complex],
    (a, b) => new Complex(a + b.re, b.im));
Function.defineOperator('*', [Number, Complex],
    (a, b) => new Complex(a * b.re, a * b.im));

module.exports = Complex;
