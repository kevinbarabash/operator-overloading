const a = new Vector(1, 2, 3);
const b = new Vector(0, 1, -2);

console.log('Vector operations:');
console.log(`a = ${a}`);
console.log(`b = ${b}`);
console.log('a + b = ' + (a + b));
console.log('a - b = ' + (a - b));
console.log('-a = ' + -a);
console.log('-b = ' + -b);

let c = new Vector(1, 0, 0);

console.log(`c = ${c}`);
console.log(`c += a = ${c += a}`);
console.log('');

const U = new Set([1, 1, 2, 3]);
const V = new Set([3, 5, 8]);

console.log('Set operations:');
console.log(`U = ${U}`);
console.log(`V = ${V}`);
console.log(`U | V = ${U | V}`);
console.log(`U & V = ${U & V}`);
console.log(`U - V = ${U - V}`);
console.log(`U ^ V = ${U ^ V}`);
console.log('');

const P = new Set([1,2,3,4,5,6]);
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

