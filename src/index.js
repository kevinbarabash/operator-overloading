require('./polyfill');

module.exports = {
    operator: require('./decorator'),
    transform: require('./transform'),
};
