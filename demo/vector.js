const { operator } = require('../src');

class Vector {
    constructor(x, y, z) {
        Object.assign(this, { x, y, z });
    }

    @operator('+')
    plus(other) {
        return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    @operator('-')
    minus(other) {
        return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    @operator('*', Number)
    scale(k) {
        return new Vector(k * this.x, k * this.y, k * this.z);
    }

    @operator('-')
    negate() {
        return new Vector(-this.x, -this.y, -this.z);
    }

    toString() {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }
}

module.exports = Vector;
