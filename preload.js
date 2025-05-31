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
        list: () => ipcRenderer.invoke('get-printers'),
        setDefault: (printer) => ipcRenderer.invoke('set-default-printer', printer),
        getDefault: () => ipcRenderer.invoke('get-default-printer'),
        print: (content) => ipcRenderer.invoke('print-default', content),

        setNetwork: (ip, port) => ipcRenderer.invoke('set-network-printer', ip, port),
        getNetwork: () => ipcRenderer.invoke('get-network-printer'),
        printNetwork: (content) => ipcRenderer.invoke('print-network', content),
    },
    kds: {
        // Get list of connected KDS clients
        getConnectedKDS: () => ipcRenderer.invoke('get-connected-kds'),

        // Send data to all KDS clients
        broadcastData: (data) => ipcRenderer.send('broadcast-data', data),

        // Send data to specific KDS
        sendDataToKDS: (kdsId, data) => ipcRenderer.send('send-data-to-kds', { kdsId, data }),

        // Disconnect a specific KDS
        disconnectKDS: (kdsId) => ipcRenderer.send('disconnect-kds', kdsId),

        // Disconnect all KDS clients
        disconnectAllKDS: () => ipcRenderer.send('disconnect-all-kds'),

        // Receive data from KDS clients
        onKDSData: (callback) => ipcRenderer.on('kds-data', (event, data) => callback(data)),

        // Listen for KDS connect/disconnect events
        onKDSConnected: (callback) => ipcRenderer.on('kds-connected', (event, data) => callback(data)),
        onKDSDisconnected: (callback) => ipcRenderer.on('kds-disconnected', (event, data) => callback(data))
    }
});
