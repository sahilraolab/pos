const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { setupDatabaseHandlers } = require('./database/orders');
const { setupKDSHandlers } = require('./services/kds');
const { setupPrinterHandlers } = require('./services/printer');


let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.setZoomLevel(-0.1);
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if ((input.key === '=' || input.key === '-' || input.key === '0') && (input.control || input.meta)) {
            event.preventDefault();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
    setupDatabaseHandlers(ipcMain);
    setupKDSHandlers(ipcMain);
    // setupPrinterHandlers(ipcMain);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});


