module.exports = {
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "Pakiki Proxy";
            return args;
        })
  },
  transpileDependencies: [
    'vuetify'
  ]
}
