const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posAPI', {
    store: {
        get: (key) => ipcRenderer.sendSync('electron-store-get', key),
        set: (key, value) => ipcRenderer.send('electron-store-set', key, value),
        has: (key) => ipcRenderer.sendSync('electron-store-has', key),
        delete: (key) => ipcRenderer.send('electron-store-delete', key),
        clear: () => ipcRenderer.send('electron-store-clear'),
        updateItem: (key, id, updatedFields) => ipcRenderer.invoke('electron-store-update-item', key, id, updatedFields),
    },
    printers: {
        list: () => ipcRenderer.invoke('get-printers'), // ✅ fixed
        setDefault: (printer) => ipcRenderer.invoke('set-default-printer', printer),
        getDefault: () => ipcRenderer.invoke('get-default-printer'),
        print: (data) => ipcRenderer.invoke('print-default', data) // ✅ fixed (printUsingDefault → print)
    }
});