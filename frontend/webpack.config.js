const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
    //setting entry and output
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        //bundel.js vendor.js and prevent user browser cache when update
        filename: "[name].[hash].js",
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
    
    //setting loader
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
              },
                     
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: '[name].[ext]',
                            limit: 8192, // 8KB
                            fallback: require.resolve('file-loader'),
                        },
                    }
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000
                        }
                    }
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "main.[hash].css"
        })
    ],
    //for debug
    devtool: "source-map",
    //for pack optimization
    optimization: {
        splitChunks: {
            chunks: "all",
            name: "vendor",
        },
    },
}