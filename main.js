const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.Serial = require('escpos-serialport');
let store;

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

    // Printer routes start


    ipcMain.handle('get-printers', async () => {
        const devices = escpos.USB.findPrinter();
        return devices.map(dev => ({
            vendorId: dev.deviceDescriptor.idVendor,
            productId: dev.deviceDescriptor.idProduct
        }));
    });

    ipcMain.handle('set-default-printer', (event, printer) => {
        store.set('defaultPrinter', printer);
        return true;
    });

    ipcMain.handle('get-default-printer', () => {
        return store.get('defaultPrinter') || null;
    });

    ipcMain.handle('print-default', async (event, content = 'Test Print') => {
        try {
            const defaultPrinter = store.get('defaultPrinter');
            if (!defaultPrinter) throw new Error('No default printer set');

            const device = new escpos.USB(defaultPrinter.vendorId, defaultPrinter.productId);
            const printer = new escpos.Printer(device);

            device.open(() => {
                printer
                    .align('ct')
                    .text(content)
                    .text('\n\n')
                    .cashdraw() // Open drawer
                    .cut()
                    .close();
            });

            return { success: true };
        } catch (err) {
            console.error('Print Error:', err);
            return { success: false, error: err.message };
        }
    });

    // Printer routes end

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


