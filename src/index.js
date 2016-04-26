import './polyfill';
import transform from './transform';

import Vector from './vector';
import SuperSet from './super-set';

fetch('sample.js')
    .then(response => response.text())
    .then(code => {
        const processedCode = transform(code);
        const fn = Function('Vector', 'Set', processedCode);

        fn(Vector, SuperSet);
    });
