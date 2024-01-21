const path = require('path');

module.exports = {
  mode: 'production', // or 'production' or 'development'
  entry: './src/index.js', // the entry point of your app
  output: {
    filename: 'bundle.js', // the output bundle
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false,
    minimizer: [
        new (require('terser-webpack-plugin'))({
            terserOptions: {
                compress: false,
                format: {
                    beautify: true,
                }
            },
        }),
    ],
  },
};
