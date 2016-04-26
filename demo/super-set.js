const { operator } = require('../src');

class SuperSet extends Set {
    @operator('<=')
    isSubset(other) {
        return [...this].every((item) => other.has(item));
    }

    @operator('>=')
    isSuperset(other) {
        return [...other].every((item) => this.has(item));
    }

    @operator('|')
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

module.exports = SuperSet;
