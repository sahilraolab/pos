const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    scanKDS: () => ipcRenderer.send('scan-kds'),
    connectKDS: (kdsInfo) => ipcRenderer.send('connect-kds', kdsInfo),
    disconnectKDS: (kdsInfo) => ipcRenderer.send('disconnect-kds', kdsInfo),
    onKDSFound: (callback) => {
        ipcRenderer.removeAllListeners('kds-found'); 
        ipcRenderer.on('kds-found', (_, kds) => callback(kds));
    },
    onKDSConnected: (callback) => {
        ipcRenderer.removeAllListeners('kds-connected'); // Remove old listeners
        ipcRenderer.on('kds-connected', (_event, data) => callback(data));
    },    
    onKDSError: (callback) => {
        ipcRenderer.removeAllListeners('kds-error');
        ipcRenderer.on('kds-error', (_, errorMessage) => callback(errorMessage));
    },
    onOrderStatus: (callback) => {
        ipcRenderer.removeAllListeners('order-status');
        ipcRenderer.on('order-status', (_, status) => callback(status));
    }
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
