module.exports = {
    transpileDependencies: [
        'resize-detector',
        'vue-echarts',
        "vuetify"
    ],
    pluginOptions: {
        electronBuilder: {
            externals: ['xlsx'],
            // builderOptions: {
            //     asar: false,
            // }
        }
    },
    configureWebpack:{
        entry:'./src/main.js',
        target:'electron-renderer',
    },

}