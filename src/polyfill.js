import {
    binaryOperators,
    logicalOperators,
    unaryOperators,
    updateOperators
} from './operator-data';

for (const name of Object.values(binaryOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(logicalOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(unaryOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(updateOperators)) {
    Symbol[name] = Symbol(name);
}

//
// String polyfill
//

String.prototype[Symbol.plus] = function(other) {
    return this + other;
};

//
// Number polyfill
//

Number.prototype[Symbol.plus] = function(other) {
    return this + other;
};

Number.prototype[Symbol.minus] = function(other) {
    return this - other;
};

Number.prototype[Symbol.times] = function(other) {
    return this * other;
};

Number.prototype[Symbol.divide] = function(other) {
    return this / other;
};

Number.prototype[Symbol.modulo] = function(other) {
    return this % other;
};

Number.prototype[Symbol.unaryMinus] = function() {
    return -this;
};

Number.prototype[Symbol.unaryPlus] = function() {
    return +this;
};

