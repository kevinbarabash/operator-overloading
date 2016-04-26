var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: '#eval-source-map',
    entry: {
        app: './src/index',
        deps: ['esprima', 'escodegen', 'estraverse']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'deps'
        })
    ],
    resolve: {
        extensions: ['', '.js', '.jsx'],
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loaders: ['json-loader'],
        }]
    },
};
