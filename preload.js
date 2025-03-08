const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    scanKDS: () => ipcRenderer.send('scan-kds'),
    connectKDS: (kdsInfo) => ipcRenderer.send('connect-kds', kdsInfo),
    disconnectKDS: (kdsInfo) => ipcRenderer.send('disconnect-kds', kdsInfo),
    sendToKDS: (ip, port, data) => ipcRenderer.send('send-to-kds', { ip, port, data }),
    sendToAllKDS: (data) => ipcRenderer.send('send-to-all-kds', data),

    onKDSFound: (callback) => {
        ipcRenderer.removeAllListeners('kds-found'); 
        ipcRenderer.once('kds-found', (_, kds) => callback(kds)); // 🔹 Use `once` instead of `on`
    },
    onKDSConnected: (callback) => {
        ipcRenderer.removeAllListeners('kds-connected'); 
        ipcRenderer.once('kds-connected', (_event, data) => callback(data)); // 🔹 Use `once`
    },
    onKDSError: (callback) => {
        ipcRenderer.removeAllListeners('kds-error');
        ipcRenderer.once('kds-error', (_, errorMessage) => callback(errorMessage)); // 🔹 Use `once`
    },
    onOrderStatus: (callback) => {
        ipcRenderer.removeAllListeners('order-status');
        ipcRenderer.on('order-status', (_, status) => callback(status));
    }, 
    onOrderUpdated: (callback) => {
        ipcRenderer.removeAllListeners('order-updated');
        ipcRenderer.on('order-updated', (_event, data) => callback(data));
    },

    connectPrinter: (printerInfo) => ipcRenderer.invoke('connect-printer', printerInfo),
    getConnectedPrinter: () => ipcRenderer.invoke('get-connected-printer'),
});

contextBridge.exposeInMainWorld('api', {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => {
        ipcRenderer.removeAllListeners(channel); // Ensure no duplicate listeners
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeListener: (channel) => ipcRenderer.removeAllListeners(channel),
});
