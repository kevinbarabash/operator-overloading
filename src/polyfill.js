const data = require('./data');

/**
 * Symbol
 */
for (const name of Object.values(data.binaryOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(data.logicalOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(data.unaryOperators)) {
    Symbol[name] = Symbol(name);
}

for (const name of Object.values(data.updateOperators)) {
    Symbol[name] = Symbol(name);
}

/**
 * String
 */
String.prototype[Symbol.plus] = function(other) {
    return this + other;
};

/**
 * Number
 */
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
