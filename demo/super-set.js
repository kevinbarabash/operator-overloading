const { operator } = require('../src');

class SuperSet extends Set {
    @operator('<=')
    isSubset(other) {
        return [...this].every((item) => other.has(item));
    }

    union(other) {
        return new SuperSet([...this, ...other]);
    }

    @operator('&')
    intersect(other) {
        return new SuperSet([...this].filter(item => other.has(item)));
    }

    @operator('-')
    difference(other) {
        return new SuperSet([...this].filter(item => !other.has(item)));
    }

    @operator('^')
    symmetricDifference(other) {
        return new SuperSet([
            ...[...this].filter(item => !other.has(item)),
            ...[...other].filter(item => !this.has(item))
        ]);
    };

    toString() {
        return `{${[...this].join(', ')}}`;
    }
}

Set.prototype.toString = function() {
    return `Set{${[...this].join(', ')}}`;
};

Function.defineOperator('|', [Set, Set], (a, b) => new Set([...a, ...b]));

module.exports = SuperSet;
