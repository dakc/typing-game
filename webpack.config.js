const path = require('path');

// this plugin is required to output css file
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


// process.env.NODE_ENV = "development";
const MODE = process.env.NODE_ENV === "development" ? "development" : "production";

module.exports = {
    mode: MODE,

    entry: {
        'script.js': ['./src/js/index.js', './src/css/index.scss'],
    },

    output: {
        // publicPath: path.resolve(__dirname, 'dist'),
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]',
        clean: true,
    },

    module: {
        rules: [{
            test: /\.(s)?css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader'
            ]
        }, ]
    },

    devtool: MODE === "development" ? "source-map" : false,

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),
    ],

};