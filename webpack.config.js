const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/i,
        use: 'ts-loader',
        exclude: ['/node_modules/'],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
		static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
	}
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
    config.devtool = 'inline-source-map';
  }
  return config;
};

