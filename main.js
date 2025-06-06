const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.Serial = require('escpos-serialport');
const os = require('os');
const { startWebSocketServer } = require('./websocketServer');
const { registerPrinterHandlers } = require('./printerHandlers');

const hostname = os.hostname(); // unique per device
let wss; // WebSocket Server instance
let connectedClients = new Set();
let orders = [];

let store;
let currentKDS = null; // Track single connected KDS

(async () => {
    const Store = (await import('electron-store')).default;
    store = new Store();
})();


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

    // mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
    mainWindow.loadURL("http://localhost:3001");

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

app.on('ready', async () => {
    createWindow();


    // ✅ Wait for electron-store to be ready
    const Store = (await import('electron-store')).default;
    const store = new Store();

    startWebSocketServer(mainWindow, store, orders);

    // IPC handlers
    ipcMain.on('electron-store-get', (event, key) => {
        event.returnValue = store.get(key);
    });

    ipcMain.on('electron-store-set', (event, key, val) => {
        store.set(key, val);
    });

    ipcMain.on('electron-store-has', (event, key) => {
        event.returnValue = store.has(key);
    });

    ipcMain.on('electron-store-delete', (event, key) => {
        store.delete(key);
    });

    ipcMain.on('electron-store-clear', () => {
        store.clear();
    });

    ipcMain.handle('electron-store-update-item', (event, key, id, updatedFields) => {
        const data = store.get(key) || [];

        if (!Array.isArray(data)) {
            throw new Error(`${key} is not an array`);
        }

        const updatedData = data.map(item => {
            if (item.id === id || item._id === id) {
                return { ...item, ...updatedFields };
            }
            return item;
        });

        store.set(key, updatedData);

        return updatedData.find(item => item.id === id || item._id === id);
    });

    registerPrinterHandlers(() => store);
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


