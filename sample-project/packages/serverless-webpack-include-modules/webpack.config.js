/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

const isLocal = slsw.lib.webpack.isLocal;

module.exports = {
  mode: isLocal ? "development" : "production",
  entry: slsw.lib.entries,
  devtool: "source-map",
  externals: [
    nodeExternals({
      additionalModuleDirs: ["../../node_modules"],
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  target: "node",
  node: {
    __dirname: true,
    __filename: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};
