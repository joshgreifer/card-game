const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = env => {
    console.log(env);
    return {
        entry: './src/index.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        output: {
            publicPath: env.NODE_ENV === 'production'
                ? ''
                : '',

            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: ['.js', '.json', '.vue', '.ts', 'js.map'],
            alias: {
                '@': path.resolve(__dirname),
                '~': path.resolve(__dirname),
            },
            modules: [
                'node_modules',
            ]
        },
        devtool: 'source-map',

        plugins: [
            new CopyPlugin({ patterns: [
                    {
                        from: 'public',
                        to: path.resolve(__dirname, 'dist'),
                        toType: 'dir',
                    },
                ]}),
        ],
    };
}