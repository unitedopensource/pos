'use strict'

import { app, BrowserWindow, ipcMain, powerSaveBlocker, remote } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, splashWindow;

powerSaveBlocker.start('prevent-display-sleep');

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const splashURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/splash.html`
  : `file://${__dirname}/splash.html`;

console.log(`file://${__dirname}/splash.html`)

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    //alwaysOnTop:true,
    frame: false,
    autoHideMenuBar: true,
    show: false
  })
  mainWindow.loadURL(winURL)
  process.argv.slice(1).some(arg=>arg.includes("debug")) && mainWindow.webContents.openDevTools()

  splashWindow = new BrowserWindow({
    width: 460,
    height: 270,
    frame: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true
  })
  splashWindow.loadURL(splashURL);

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
    splashWindow = null;
    process.exit(0);
  })
}

let singleInstance = app.makeSingleInstance((command, working) => {
  if (mainWindow) {
    mainWindow.isMinimized() && mainWindow.restore();
    mainWindow.focus();
  }
});

singleInstance && app.quit(0);

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(0)
  }
})

app.on('activate', () => {
  mainWindow === null && createWindow() 
})

ipcMain.on("Exit", () => {
  app.quit(0)
});

ipcMain.on("Loading", (e, txt) => {
  splashWindow.webContents.send("Processing", txt);
});

ipcMain.on("Initialized", () => {
  process.argv.slice(1).some(arg=>arg.includes("fullscreen")) && mainWindow.setFullScreen(true);
  splashWindow.close();
  mainWindow.show();
  mainWindow.center();
});

ipcMain.on("Exit",()=>{
  app.quit(0)
})

ipcMain.on("Relaunch", () => {
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
  app.exit(0)
});

ipcMain.on("Shutdown", () => {
  const exec = require('child_process').exec;
  exec('shutdown -s -f -t 0');
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
