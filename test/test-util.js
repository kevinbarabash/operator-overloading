const babel = require('babel-core');

const run = (code) => {
    const fn = Function(babel.transform(code, {
            presets: ["es2015", "stage-1"],
            plugins: ["babel-plugin-operator-overloading"]
        }).code + '\nreturn result;');

    return fn();
};

const runWithArgs = (code, names, values) => {
    const fn = Function(...names, babel.transform(code, {
            presets: ["es2015", "stage-1"],
            plugins: ["babel-plugin-operator-overloading"]
        }).code + '\nreturn result;');

    return fn(...values);
};

const compile = (code) =>
    babel.transform(code, {
        plugins: ["babel-plugin-operator-overloading"]
    }).code;

module.exports = { run, runWithArgs, compile };
