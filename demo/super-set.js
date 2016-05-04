const { operator } = require('../src');

class SuperSet extends Set {
    @operator('<=')
    isSubset(other) {
        return [...this].every((item) => other.has(item));
    }

    union(other) {
        return new SuperSet([...this, ...other]);
    }

    intersect(other) {
        return new SuperSet([...this].filter(item => other.has(item)));
    }

    difference(other) {
        return new SuperSet([...this].filter(item => !other.has(item)));
    }

    symmetricDifference(other) {
        return new SuperSet([
            ...[...this].filter(item => !other.has(item)),
            ...[...other].filter(item => !this.has(item))
        ]);
    };

    toString() {
        return `Super{${[...this].join(', ')}}`;
    }
}

Set.prototype.toString = function() {
    return `Set{${[...this].join(', ')}}`;
};

Function.defineOperator('|', [Set, Set], (a, b) => new Set([...a, ...b]));
Function.defineOperator('&', [Set, Set], (a, b) => new Set([...a].filter(item => b.has(item))));
Function.defineOperator('-', [Set, Set], (a, b) => new Set([...a].filter(item => !b.has(item))));
Function.defineOperator('^', [Set, Set], (a, b) => new SuperSet([
    ...[...a].filter(item => !b.has(item)),
    ...[...b].filter(item => !a.has(item))
]));

module.exports = SuperSet;
