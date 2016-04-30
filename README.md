# Operator Overloading

Working with classes that define standard arithmetic operations result in code
that takes longer to write and is harder to read.

__without overloading__
```javascript
let u = new Vector(1, 0);
let v = new Vector(2, -1);

let w = u.add(v);
w = w.plus(v.scale(3));
```

__with overloading__
```javascript
let u = new Vector(1, 0);
let v = new Vector(2, -1);

let w = u + v;
w += 3 * v;
```

## `Function.defineOperator`

### Binary Operators

Binary operators are defined as follows:
```javascript
Function.defineOperator(Vector + Vector,
    (u, v) => new Vector(u.x + v.x, u.y + v.y);
```

This desugars to the following:
```javascript
Function.defineOperator({
    type: 'BinaryOperator',
    left: Vector,
    operator: '+',
    right: Vector
}, (u, v) => new Vector(u.x + v.x, u.y + v.y));
```

The `Vector + Vector` syntax can be polyfilled with:
```javascript
Function.defineOperator({
    type: 'BinaryOperator',
    left: Function,
    operator: '+',
    right: Function,
}, (A, B) => {
    return {
        type: 'BinaryOperator',
        left: A,
        operator: '+',
        right: B
    };
});
```

### Unary Operators

Unary operators are defined as follows:
```javascript
Function.defineOperator(- Vector, (v) => new Vector(-v.x, -v.y));
```

This desugars to the followign:
```javascript
Function.defineOperator({
    type: 'UnaryOperator',
    operator: '-',
    argument: Vector
}, (v) => new Vector(-v.x, -v.y);
```

The `- Vector` syntax can be polyfilled with:
```javascript
Function.defineOperator({
    type: 'UnaryOperator',
    operator: '-',
    argument: Function
}, (Type) =>  {
    return {
        type: 'UnaryOperator',
        operator: '-',
        argument: Type
    };
});
```

__Notes:__
- Commutative operators, `+`, `*`, `&&`, `||`, `&`, `|`, `^`, automatically
  flip the order of operands when their types are different.
- `Function.defineOperator(T == T, (a, b) => fn(a, b)` will automatically define
  `!=` as `(a, b) => !fn(a, b)`.
- `!` and `!=` cannot be overloaded in order to perserve identities:
  
  ```
  X ? A : B <=> !X ? B : A
  !(X && Y) <=> !X || !Y
  !(X || Y) <=> !X && !Y
  X != Y    <=> !(X == Y)
  ```
  Source: http://www.slideshare.net/BrendanEich/js-resp (page 7)
- `>` and `>=` are derived from `<` and `<=` as follows:
  
  ```
  A > B     <=> B < A
  A >= B    <=> B <= A
  ```
  Source: http://www.slideshare.net/BrendanEich/js-resp (page 8)

## `'use overloading'` directive

The `'use overloading'` directive can be used to limit the scope of overloading
can be used.  This directive is opt-in because for existing code it will have
negative performance impacts.  In general, overloading should be used where
readability is more important that performance.

It can be used at the start of a file or function/method definition.  The
`@operator` section has an example of the `'use overloading'` directive in action.

## `@operator` decorator

The `@operator` decorator is a convenience for declaring methods as operators
when defining a class.

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

    @operator('*', Number)
    scale(factor) {
        return new Vector(factor * this.x, factor * this.y);
    }
}
```

The `@operator` decorator makes the assumption that both operands are the same
type as the class.  If this is not the case, the type of the other operand can
be specified as the second parameter to `@operator`.

## Implementation Details

The following code:

```javascript
'use overloading'

let u = new Vector(1, 0);
let v = new Vector(2, -1);

let w = u + v;
w += 3 * v;
```

relies one the following operators to be defined:

```javascript
Function.defineOperator(Vector + Vector,
    (u, v) => new Vector(u.x + v.x, u.y + v.y);

Function.defineOperator(Number * Vector, (k, v))
```

and compiles to:

```javascript
let u = new Vector(1, 0);
let v = new Vector(2, -1);

let w = Function[Symbol.plus](u, v);
w = Function[Symbol.plus](w, Function[Symbol.times](3, v));
```

The implementation defines the following well-known Symbols:

__Binary Operators__
- plus `+`
- minus `-`
- times `*`
- divide `/`
- remainder `%`
- equality `==`
- inequality `!=`
- strictEquality `===`
- strictInequality `!==`
- lessThan `<`
- lessThanOrEqual `<=`
- greaterThan `>`
- greaterThanOrEqual `>=`
- shiftLeft `<<`
- shiftRight `>>`
- unsignedShiftRight `>>>`
- bitwiseOr `|`
- bitwiseAnd `&`
- bitwiseXor `^`
- logicalOr `||`
- logicalAnd `&&`

__Unary Operators__
- unaryPlus `+`
- unaryMinus `-`
- bitwiseNot `~`
- logicalNot `!`

__Note:__ only the following operators can actually be overloaded:
  `|`, `^`, `&`, `==`, `<`, `<=`, `<<`, `>>`, `>>>`, `+`, `-`, `*`, `/`, `%`,
  `~`, unary`-`, and unary`+`

### Function Lookup

The functions for each operator are stored in a lookup table.  When a call to
`Function.defineOperator` is made, we get the `prototype` for the types of the
arguments.  The prototypes are stored in a protoypes array the index of the
`prototype` from that array is used to determine the key in the lookup table.

In the case of unary operators the index is the key.  For binary operators, the
index is a string with the two indices separate by commas.

## Future Work

- [] handle prototype chain
- [] use static type information to improve performance (could determine which
  function to call at compile time)

