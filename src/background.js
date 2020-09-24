'use strict'

import { app, protocol, BrowserWindow,Session,ipcMain,Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import createWorkerWindow from "./windows/workerWindow";
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from "path";
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let workerWindow
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow() {
  // Menu.setApplicationMenu(null)
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 800,

    webPreferences: {
      backgroundColor: '#f1f1f1' ,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true
    }
  })



  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools()

    }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    win.setMenu(null);
  }

  win.on('closed', () => {
    win = null
    workerWindow.close()
  })

  workerWindow=createWorkerWindow (BrowserWindow)

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {

  let excelOptionsPath=process.cwd()+'/config.json'
  const fs=require('fs')
  let excelOptions= {
    year: 4,
    month: 5,
    day: 6,
    hour: 7,
    wd: 8,
  };
  if(!fs.existsSync(excelOptionsPath)){
    fs.writeFileSync(excelOptionsPath,JSON.stringify(excelOptions))
  }

  if (isDevelopment && !process.env.IS_TEST) {

    // Install Vue Devtools
    try {
      // 安装vue-devtools
      // let extensions = Session.defaultSession.getAllExtensions()
      // console.log(111)
      // if ( !extensions[ 'Vue.js devtools' ] ) {
      //   console.log(122)
      //   await Session.defaultSession.loadExtension('./vue-devtools')
      // }
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  ipcMain.on('message-from-worker', (event, arg) => {
    sendWindowMessage(win, 'message-from-worker', arg)
  })
  ipcMain.on('message-from-renderer', (event, arg) => {
    sendWindowMessage(workerWindow, 'message-from-renderer', arg)
  })
  createWindow()
})

function sendWindowMessage(targetWindow, channel, payload) {
  if (typeof targetWindow === 'undefined') {
    console.log('Target window does not exist')
    return
  }
  targetWindow.webContents.send(channel, payload)
}


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
