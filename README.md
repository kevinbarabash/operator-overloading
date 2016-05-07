# Operator Overloading

In some situations operator overloading can result in code that's easier to
write and easier to read.

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

Binary operators are defined as follows:
```javascript
Function.defineOperator(
    '+',
    [Vector, Vector],
    (u, v) => new Vector(u.x + v.x, u.y + v.y)
);
```

Unary operators are defined as follows:
```javascript
Function.defineOperator(
    '-',
    [Vector],
    (v) => new Vector(-v.x, -v.y)
);
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
- Redefining some operators on some built-in types is prohibited.  The reason
  being that operator overloading should be used to make classes that don't
  have operator support easier to work with and prevent changing behavior of
  those classes do that.
  - all operators on `[Number, Number]`
  - logical operators on `[Boolean, Boolean]`
  - `+` on `[String, String]`
  - unary `+` and `-` on [Number]

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
- Symbol.plus `+`
- Symbol.minus `-`
- Symbol.times `*`
- Symbol.divide `/`
- Symbol.remainder `%`
- Symbol.equality `==`
- Symbol.inequality `!=`
- Symbol.lessThan `<`
- Symbol.lessThanOrEqual `<=`
- Symbol.greaterThan `>`
- Symbol.greaterThanOrEqual `>=`
- Symbol.shiftLeft `<<`
- Symbol.shiftRight `>>`
- Symbol.unsignedShiftRight `>>>`
- Symbol.bitwiseOr `|`
- Symbol.bitwiseAnd `&`
- Symbol.bitwiseXor `^`
- Symbol.logicalOr `||`
- Symbol.logicalAnd `&&`

__Unary Operators__
- Symbol.unaryPlus `+`
- Symbol.unaryMinus `-`
- Symbol.bitwiseNot `~`

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

TODO: describe how prototype chain support works.

## Future Work

- [x] handle prototype chain
- [ ] support exponentiation operator
- [ ] use static type information to improve performance (could determine which
  function to call at compile time)

