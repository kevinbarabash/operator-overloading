require('babel-register');
require('babel-polyfill');
const babel = require('babel-core');
const fs = require('fs');

const transform = require('../src').transform;

const Vector = require('./vector');
const SuperSet = require('./super-set');

fs.readFile('demo/sample.js', { encoding: 'utf-8' }, (err, res) => {
    const code = babel.transform(transform(res), {
        presets: ["es2015", "stage-1"]
    }).code;

    const fn = Function('Vector', 'Set', code);
    fn(Vector, SuperSet);
});
