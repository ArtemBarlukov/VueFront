const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
        VUE_OPTIONS_API__: true,
        VUE_PROD_DEVTOOLS__: false
      })
    ]
  }
  // devServer: {
  //   proxy: {
  //     '/api': { 
  //       target: 'http://127.0.0.1:8000', 
  //       changeOrigin: true, 
  //     }
  //   }
  // }
})
