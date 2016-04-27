const constructors = [];
const operators = {};

const binaryDefault = '-1,-1';
const unaryDefault = '-1';

['+', '-', '*', '/', '%'].forEach(op =>  operators[op] = {});

operators['+'][binaryDefault] = (a, b) => a + b;
operators['-'][binaryDefault] = (a, b) => a - b;
operators['*'][binaryDefault] = (a, b) => a * b;
operators['/'][binaryDefault] = (a, b) => a / b;
operators['%'][binaryDefault] = (a, b) => a % b;

operators['-'][unaryDefault] = (a) => -a;

const commutatives = ['+', '*', '&&', '||', '&', '|', '^'];

const defineBinaryOperator = function(desc, fn) {
    const [left, operator, right] = desc;

    const leftPrototype = left.prototype;
    const rightPrototype = right.prototype;

    if (!constructors.includes(leftPrototype)) {
        constructors.push(leftPrototype);
    }

    if (!constructors.includes(rightPrototype)) {
        constructors.push(rightPrototype);
    }

    const lid = constructors.indexOf(leftPrototype);
    const rid = constructors.indexOf(rightPrototype);
    const id = `${lid},${rid}`;

    if (!operators.hasOwnProperty(operator)) {
        operators[operator] = {};
    }

    operators[operator][id] = fn;

    // handle commutative operations automatically
    if (commutatives.includes(operator) && left !== right) {
        operators[operator][`${rid},${lid}`] = (a, b) => fn(b, a);
    }
};

const defineUnaryOperator = function(desc, fn) {
    const [operator, right] = desc;

    const rightPrototype = right.prototype;

    if (!constructors.includes(rightPrototype)) {
        constructors.push(rightPrototype);
    }

    const id = constructors.indexOf(rightPrototype);

    if (!operators.hasOwnProperty(operator)) {
        operators[operator] = {};
    }

    operators[operator][id] = fn;
};

Function.defineOperator = function(desc, fn) {
    switch (desc.length) {
        case 2:
            defineUnaryOperator(desc, fn);
            break;
        case 3:
            defineBinaryOperator(desc, fn);
            break;
        default:
            throw new Error('invalid descriptor');
    }
};

Symbol.plus = Symbol('plus');
Symbol.minus = Symbol('minus');
Symbol.times = Symbol('times');
Symbol.divide = Symbol('divide');
Symbol.remainder = Symbol('remainder');

Symbol.unaryMinus = Symbol('unaryMinus');

const createBinaryOperator = (op) =>
    (left, right) => {
        const lid = constructors.indexOf(Object.getPrototypeOf(left));
        const rid = constructors.indexOf(Object.getPrototypeOf(right));

        const fn = operators[op][`${lid},${rid}`] || operators[op]['-1,-1'];
        return fn(left, right);
    };

const createUnaryOperator = (op) =>
    (right) => {
        const id = constructors.indexOf(Object.getPrototypeOf(right));

        const fn = operators[op][id] || operators[op]['-1'];
        return fn(right);
    };

Function[Symbol.plus] = createBinaryOperator('+');
Function[Symbol.minus] = createBinaryOperator('-');
Function[Symbol.times] = createBinaryOperator('*');
Function[Symbol.divide] = createBinaryOperator('/');
Function[Symbol.remainder] = createBinaryOperator('%');

Function[Symbol.unaryMinus] = createUnaryOperator('-');


const Point = function(x, y) {
    Object.assign(this, { x, y });
};

Function.defineOperator([Point, '+', Point], (a, b) => new Point(a.x + b.x, a.y + b.y));
Function.defineOperator([Point, '-', Point], (a, b) => new Point(a.x - b.x, a.y - b.y));
Function.defineOperator([Number, '*', Point], (k, p) => new Point(k * p.x, k * p.y));
Function.defineOperator(['-', Point], (p) => new Point(-p.x, -p.y));


const Complex = function(re, im = 0) {
    Object.assign(this, { re, im });
};

Function.defineOperator([Complex, '+', Complex], (a, b) => new Complex(a.re + b.re, a.im + b.im));
Function.defineOperator([Complex, '-', Complex], (a, b) => new Complex(a.re - b.re, a.im - b.im));
Function.defineOperator([Complex, '*', Complex], (a, b) => new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re));
Function.defineOperator([Number, '+', Complex], (a, b) => new Complex(a + b.re, b.im));
Function.defineOperator([Number, '*', Complex], (a, b) => new Complex(a * b.re, a * b.im));
// TODO: think about type coercion from Number to Complex


console.log(Function[Symbol.plus](5, 10));

const a = new Complex(1, -1);
const b = new Complex(0, 3);

console.log(Function[Symbol.plus](a, b));
console.log(Function[Symbol.minus](a, b));
console.log(Function[Symbol.times](a, b));
console.log(Function[Symbol.plus](5, b));
console.log(Function[Symbol.plus](a, 10));

const p = new Point(1, 1);
const q = new Point(5, 10);

console.log(Function[Symbol.plus](p, q));
console.log(Function[Symbol.minus](p, q));
console.log(Function[Symbol.times](2, q));
console.log(Function[Symbol.times](q, 2));
console.log(Function[Symbol.unaryMinus](p));
console.log(Function[Symbol.unaryMinus](10));

console.log(operators);
