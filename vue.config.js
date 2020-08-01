module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload/preload.js',
    }
  }
}