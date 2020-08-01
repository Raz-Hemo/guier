const { ipcRenderer } = require('electron')
const config = require('electron-json-config')
window.ipcRenderer = ipcRenderer
window.config = config
