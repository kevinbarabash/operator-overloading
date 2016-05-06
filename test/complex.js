function Complex(re, im = 0) {
    Object.assign(this, { re, im });
}

Function.defineOperator(
    '+',
    [Complex, Complex],
    (a, b) => new Complex(a.re + b.re, a.im + b.im)
);

Function.defineOperator(
    '+',
    [Number, Complex],
    (a, b) => new Complex(a + b.re, b.im)
);

Function.defineOperator(
    '*',
    [Complex, Complex],
    (a, b) => new Complex(a.re * a.re - (b.im * b.im), a.re * b.im + a.im * b.re)
);

Function.defineOperator(
    '*',
    [Number, Complex],
    (a, b) => new Complex(a * b.re, a * b.im)
);

module.exports = Complex;
