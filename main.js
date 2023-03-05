// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const oto = require('./oto/gen-promo-list-mod')
const isMac = process.platform === 'darwin'

let rootBrowserWindow = null

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        minWidth: 500,
        icon: `${__dirname}/images/icon.png`,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    //////////////////
    const menu = Menu.buildFromTemplate([
        {
            label: '&File',
            submenu: [
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'About',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://mis.gsu.edu.ph')
                    }
                }
            ]
        }
    ])
    Menu.setApplicationMenu(menu)
    //////////////////////////////////////


    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    ipcMain.handle('mis:onDataFromRenderer', async (_event, params) => {
        try {
            await oto(params, rootBrowserWindow)
            return 'Ok'
        } catch (err) {
            return err
        }
    })

    rootBrowserWindow = createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (!isMac) app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.