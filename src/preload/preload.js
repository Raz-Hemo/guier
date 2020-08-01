const { ipcRenderer } = require('electron')
const config = require('electron-json-config')
const spawn = require('child_process').spawn
window.ipcRenderer = ipcRenderer
window.config = config
window.spawnProcess = spawn
