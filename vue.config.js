module.exports = {
    transpileDependencies: [
        'resize-detector',
        'vue-echarts',
        "vuetify"
    ],
    pluginOptions: {
        electronBuilder: {
            externals: ['xlsx'],
            builderOptions: {
                asar: false,
            }
        }
    },
}