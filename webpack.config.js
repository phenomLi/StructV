const path = require('path');


module.exports = {
    entry: './src/StructV.ts',
    output: {
		filename: './sv.js',
		//path: path.resolve(__dirname, './../Visualizer/src/StructV'),
     	libraryTarget: 'umd'
    },
    resolve: {
		// 先尝试以ts为后缀的TypeScript源码文件
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/, 
				loader: 'awesome-typescript-loader',
				options: {
					configFileName: './atlconfig.json'
				}
			}
		]
	},
	//devtool: 'eval-source-map'
};
