require('babel-register');
require('babel-polyfill');
require('../src/define-operator');
const babel = require('babel-core');
const fs = require('fs');

fs.readFile('demo/sample.js', { encoding: 'utf-8' }, (err, res) => {
    const code = babel.transform(res,{
        presets: ["es2015", "stage-1"],
        plugins: ["./src/babel-operator-overloading-plugin.js"]
    }).code;

    const fn = Function('require', code);
    fn(require);
});
