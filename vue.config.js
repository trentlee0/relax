module.exports = {
  publicPath: './',
  transpileDependencies: [
    'vuetify'
  ],
  productionSourceMap: false,
  pwa: {
    name: 'Relax',
    themeColor: '#38B47B',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'white',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  }
}
