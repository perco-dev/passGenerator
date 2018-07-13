const webpack = require("webpack");

module.exports = {
  entry: [
    "react-hot-loader/patch",
    "./src/index.js"
  ],
  module:{
    rules:[
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
            "babel-loader",
        ]
      },
      {
        test: /\.css$/,
        use : [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  resolve:{
    extensions:["*",".js",".jsx",".css","json"],
  },
  output:{
    path: __dirname + "./dist",
    publicPath: "/",
    filename: "bundle.js"
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  devServer: {
    contentBase: "./dist",
    hot:true
  }
};
