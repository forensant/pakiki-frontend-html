module.exports = {
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "Pākiki Proxy";
            return args;
        })
  },
  transpileDependencies: [
    'vuetify'
  ]
}
