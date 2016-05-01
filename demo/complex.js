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

const sqrt = Math.sqrt.bind(Math);
const abs = Math.abs.bind(Math);

Math.sqrt = (x) => {
    if (typeof x === 'number') {
        if (x < 0) {
            return new Complex(0, sqrt(-x));
        } else {
            return sqrt(x);
        }
    } else if (x instanceof Complex) {
        throw new Error("we don't handle this case yet");
    }
};

// TODO: think about type coercion from Number to Complex

// TODO: should we return a regular number if re === 0?
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
Function.defineOperator('==', [Complex, Complex],
    (a, b) =>  a.re === b.re && a.im === b.im);

module.exports = Complex;
