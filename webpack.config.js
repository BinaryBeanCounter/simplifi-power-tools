const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isAnalyze = process.env.ANALYZE === 'true';

module.exports = {
  mode: 'production', // or 'production' or 'development'
  entry: './src/index.js', // the entry point of your app
  output: {
    filename: 'bundle.js', // the output bundle
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
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
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'static' }],
    }),
    // Only add the analyzer if ANALYZE=true on the build in webpack
    ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],
};
