module.exports = {
  publicPath: './',
  transpileDependencies: [
    'vuetify'
  ],
  productionSourceMap: false,
  pwa: {
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  },
  chainWebpack: (config) => {
    if (process.env.APP_MODE === 'utools') {
      config.plugins.delete('pwa')
      config.plugins.delete('workbox')
    }
  }
}
