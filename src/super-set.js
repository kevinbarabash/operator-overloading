import operator from './operator';

export default class SuperSet extends Set {
    @operator('<=')
    isSubset(t) {
        // TODO: implement this
    }

    @operator('>=')
    isSuperset(t) {
        // TODO: implement this
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
}
