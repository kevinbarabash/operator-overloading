# Operator Overloading

## Version 1: Method Based

```javascript
class Vector {
    constructor(x, y) {
        Object.assign(this, { x, y });
    }

    @operator('+')
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    @operator('-')
    neg() {
        return new Vector(-this.x, -this.y);
    }

    @operator('-')
    sub(other) {
        'use overloading';
        return this + -other;
    }
}

let position = new Vector(0, 0);
let velocity = new Vector(2, -1);

const animate = () => {
    position += velocity;
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);
```

### Features
- convenient decorator syntax
- automatic handling of assignment operators
- differentiates between unary and binary operators
- opt-in: limit scope to function or file with `'use overloading'` directive [TODO]

### Implementation Details

The `@operator` decorator adds additional methods to a class.

```javascript
@operator('+')
add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
}

// Adds the following method
[Symbol.plus](other) {
    return new Vector(this.x + other.x, this.y + other.y);
}
```

The use symbols avoids naming collisions.  The library adds a whole bunch of
well-known symbols to the global `Symbol` object, see below for the full list.

Code containing the `'use overloading'` directive will be transformed so that
all operators become method calls.

```javascript
'use overloading'

let position = new Vector(0, 0);
let velocity = new Vector(2, -1);

position = velocity + position;
// position = velocity[Symbol.plus](position);

position += velocity;
// position = velocity[Symbol.plus](position);
```

### Drawbacks
- it's slower [TODO: measure how slow]
- operations have be defined on existing classes, String and Number
- classes that want interoperate need to know about each other

## Version 2: Function.defineOperator [coming soon]

This is inspired by a proposal by Brendan Eich, see
http://www.slideshare.net/BrendanEich/js-resp (slide 13).

```javascript
Function.defineOperator([Vector, '+', Vector], (left, right) =>
    new Vector(left.x + right.x, left.y + right.y);

Function.defineOperator([Number, '*', Vector], (k, vec) =>
    new Vector(k * vec.x, k * vec.y);

Function.defineOperator(['-', Vector], (vec) =>
    new Vector(-vec.x, -vec.y);

// Function.defineComparison()
```

TODO: provide a way to define all comparison operators with a single function

### Desugaring

```javascript
let position = new Vector(0, 0);
let velocity = new Vector(2, -1);

position = velocity + position;
// position = Function[Symbol.plus](velocity, position);

position += velocity;
// position = Function[Symbol.plus](velocity, position);
```

TODO: describe defintion and lookup

TODO: describe how static typing could improve performance
