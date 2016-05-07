require('babel-register');
require('babel-polyfill');
require('../src/define-operator');

const assert = require('assert');

const { run, runWithArgs, compile } = require('./test-util');

const Complex = require('./complex');

Function.defineOperator('*', [Number, String], (num, str) => str.repeat(num));
Function.defineOperator('|', [Set, Set], (a, b) => new Set([...a, ...b]));
Function.defineOperator('<=', [Set, Set], (a, b) => [...a].every((item) => b.has(item)));
Function.defineOperator('<', [Set, Set], (a, b) => a.size < b.size && [...a].every((item) => b.has(item)));
Function.defineOperator('==', [Array, Array], (a, b) => {
    if (a.length !== b.length) {
        return false;
    } else {
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
    }
    return true;
});

describe('Operator Overloading', () => {
    it(`file level with "use overloading" directive`, () => {
        const result = run(`
            "use overloading";
            
            const result = 3 * "foo";
        `);

        assert.equal(result, "foofoofoo");
    });

    it(`file level without "use overloading" directive`, () => {
        const result = run(`            
            const result = 3 * "foo";
        `);

        assert.equal(typeof result, 'number');
        assert(isNaN(result));
    });

    it(`function level with and without "use overloading" directive`, () => {
        const result = run(`
            const result = {};
            
            (function() {
                "use overloading";
                
                result.with = 3 * "foo";
            })();
            
            if (true) {
                result.without = 3 * "foo";
            }
        `);

        assert.equal(result.with, "foofoofoo");

        assert.equal(typeof result.without, 'number');
        assert(isNaN(result.without));
    });

    it('handles default operations on numbers', () => {
        const result = run(`
            "use overloading";
            
            const result = {
                plus: 10 + 5,
                minus: 10 - 5,
                times: 10 * 5,
                divide: 10 / 5
            };
        `);

        assert.deepEqual(result, {
            plus: 15,
            minus: 5,
            times: 50,
            divide: 2,
        });
    });

    it('handles default operators on strings', () => {
        const result = run(`
            "use overloading";
            
            const result = 'foo' + 'bar';
        `);

        assert.deepEqual(result, 'foobar');
    });

    it('handles subclasses defined after the operator has been overloaded on the parent class', () => {
        const result = run(`
            "use overloading";
            
            class SuperSet extends Set {
                toString() {
                    return [...this].join(', ');
                }
            }
            
            const a = new SuperSet([1,2]);
            const b = new SuperSet([2,3]);
            
            const result = a | b;
        `);

        assert.deepEqual([...result], [1, 2, 3]);
    });

    it('ignores instanceof, in, typeof, etc. operators', () => {
        const code = compile(`
            const a = typeof "foo";
            const b = "x" in { x: 5, y: 10 };
            const c = "foo" instanceof String;
        `);

        assert(code.includes('const a = typeof "foo";'));
        assert(code.includes('const b = "x" in { x: 5, y: 10 };'));
        assert(code.includes('const c = "foo" instanceof String;'));
    });

    it('&&, ||, and ! cannot be overloaded', () => {
        assert.throws(() => {
            Function.defineOperator('&&', [Set, Set], (a, b) => {});
        });

        assert.throws(() => {
            Function.defineOperator('||', [Set, Set], (a, b) => {});
        });

        assert.throws(() => {
            Function.defineOperator('!', [Set, Set], (a, b) => {});
        });
    });

    it('X != Y    <=> !(X == Y) holds', () => {
        const result = run(`
            "use overloading";
            
            const a = [1,2,3];
            const b = [1,2,3];
            const c = [4,5,6];

            const result = {
                abEqual: a == b,
                abNotEqual: a != b,
                bcEqual: b == c,
                bcNotEqual: b != c,
            };
        `);

        assert.deepEqual(result, {
            abEqual: true,
            abNotEqual: false,
            bcEqual: false,
            bcNotEqual: true,
        });
    });

    it('reverses commutable operators', () => {
        const result = runWithArgs(`
            "use overloading";
            
            const z = new Complex(1, -2);
            const a = 3;
            
            const result = {
                azProd: a * z,
                zaProd: z * a,
                azSum: a + z,
                zaSum: z + a,
            };
        `, ['Complex'], [Complex]);

        assert.deepEqual(result, {
            azProd: { re: 3, im: -6 },
            zaProd: { re: 3, im: -6 },
            azSum: { re: 4, im: -2 },
            zaSum: { re: 4, im: -2 },
        });
    });

    it('A > B     <=> B < A', () => {
        const result = run(`
            "use overloading";
            
            const a = new Set([1,2,3]);
            const b = new Set([1,2,3]);
            const c = new Set([1,2]);
            
            const result = {
                abStrictSubset: a < b,
                abStrictSuperset: a > b,
                bcStrictSubset: b < c,
                bcStrictSuperset: b > c
            };
        `);

        assert.deepEqual(result, {
            abStrictSubset: false,
            abStrictSuperset: false,
            bcStrictSubset: false,
            bcStrictSuperset: true,
        });
    });

    it('A >= B    <=> B <= A', () => {
        const result = run(`
            "use overloading";
            
            const a = new Set([1,2,3]);
            const b = new Set([1,2,3]);
            const c = new Set([1,2]);
            
            const result = {
                abSubset: a <= b,
                abSuperset: a >= b,
                bcSubset: b <= c,
                bcSuperset: b >= c
            };
        `);

        assert.deepEqual(result, {
            abSubset: true,
            abSuperset: true,
            bcSubset: false,
            bcSuperset: true,
        });
    });

    it('should handle defining operations on Objects', () => {
        Function.defineOperator('+', [Object, Object], (a, b) => 42);

        const result = run(`
            "use overloading";
            
            const result = {} + {};
        `);

        assert.equal(result, 42);

        // cleanup so we don't affect other tests
        Function.defineOperator('+', [Object, Object], (a, b) => a + b);
    });

    it('should handle operations on null', () => {
        const result = run(`
            "use overloading";
            
            const result = null + 1;
        `);

        assert.equal(result, 1);
    });

    it('should handle operations on undefined', () => {
        const result = run(`
            "use overloading";
            
            const result = undefined + 1;
        `);

        assert(typeof result === 'number');
        assert(isNaN(result));
    });

    it('overloading operators for [Number, Number] is prohibited', () => {
        assert.throws(() => {
            run(`
                "use overloading";
                
                Function.defineOperator('+', [Number, Number], (a, b) => a - b);
                
                const result = 1 + 2;
            `);
        });
    });

    it(`overloading '+' for [String, String] is prohibited`, () => {
        assert.throws(() => {
            run(`
                "use overloading";
                
                Function.defineOperator('+', [String, String], (a, b) => a - b);
                
                const result = 1 + 2;
            `);
        });
    });

    it(`overloading '&&' or '||' for [Boolean, Boolean] is prohibited`, () => {
        assert.throws(() => {
            run(`
                "use overloading";
                
                Function.defineOperator('&&', [Boolean, Boolean], (a, b) => a + b);
                
                const result = true && false;
            `);
        });

        assert.throws(() => {
            run(`
                "use overloading";
                
                Function.defineOperator('||', [Boolean, Boolean], (a, b) => a + b);
                
                const result = true || false;
            `);
        });
    });
});
