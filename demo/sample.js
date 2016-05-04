'use overloading';

const Complex = require('./complex');
const Vector = require('./vector');
const SuperSet = require('./super-set');

const a = new Complex(1, -1);
const b = new Complex(0, 3);

console.log('Complex numbers:');
console.log(`a = ${a}`);
console.log(`b = ${b}`);
console.log(`a == new Complex(1, -1) = ${a == new Complex(1, -1)}`);
console.log(`a === new Complex(1, -1) = ${a === new Complex(1, -1)}`);
console.log(`b == new Complex(1, -1) = ${b == new Complex(1, -1)}`);
console.log(`a + b = ${a + b}`);
console.log(`a - b = ${a - b}`);
console.log(`a * b = ${a * b}`);
console.log(`5 * b = ${5 * b}`);
console.log(`a + 10 = ${a + 10}`);

console.log(`Math.sqrt(-25) = ${Math.sqrt(-25)}`);
console.log('');

const u = new Vector(1, 2, 3);
const v = new Vector(0, 1, -2);

console.log('Vector operutions:');
console.log(`u = ${u}`);
console.log(`v = ${v}`);
console.log(`u + v = ${u + v}`);
console.log(`u - v = ${u - v}`);
console.log(`-u = ${-u}`);
console.log(`-v = ${-v}`);
console.log(`3 * ${u} = ${3 * u}`);

let w = new Vector(1, 0, 0);

console.log(`w = ${w}`);
console.log(`w += v = ${w += v}`);
console.log('');

const U = new SuperSet([1, 1, 2, 3]);
const V = new SuperSet([3, 5, 8]);

console.log('Set operations:');
console.log(`U = ${U}`);
console.log(`V = ${V}`);
console.log(`U | V = ${U | V}`);
console.log(`U & V = ${U & V}`);
console.log(`U - V = ${U - V}`);
console.log(`U ^ V = ${U ^ V}`);
console.log('');

const P = new SuperSet([1,2,3,4,5,6]);
const Q = new Set([2,4,6]);
const R = new Set([1,2,3]);

console.log(`P = ${P}`);
console.log(`Q = ${Q}`);
console.log(`R = ${R}`);
console.log(`P >= Q = ${P >= Q}`);
console.log(`P <= Q = ${P <= Q}`);
console.log(`R >= R = ${R >= R}`);
console.log(`R <= R = ${R <= R}`);
console.log('');

console.log('Intentional errors:');
try {
    console.log(U ^ 2);
} catch (e) {
    console.log(e);
}

