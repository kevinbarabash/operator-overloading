import operator from './operator-decorator';

export default class SuperSet extends Set {
    @operator('<=')
    isSubset(t) {
        return [...this].every((item) => t.has(item));
    }

    @operator('>=')
    isSuperset(t) {
        return [...t].every((item) => this.has(item));
    }

    @operator('|')
    union(t) {
        return new SuperSet([...this, ...t]);
    }

    @operator('&')
    intersect(t) {
        return new SuperSet([...this].filter(item => t.has(item)));
    }

    @operator('-')
    difference(t) {
        return new SuperSet([...this].filter(item => !t.has(item)));
    }

    @operator('^')
    symmetricDifference(t) {
        return new SuperSet([
            ...[...this].filter(item => !t.has(item)),
            ...[...t].filter(item => !this.has(item))
        ]);
    };

    toString() {
        return `{${[...this].join(', ')}}`;
    }
}
