const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    scanKDS: () => ipcRenderer.send('scan-kds'),
    connectKDS: (kdsInfo) => ipcRenderer.send('connect-kds', kdsInfo),
    disconnectKDS: (kdsInfo) => ipcRenderer.send('disconnect-kds', kdsInfo),
    sendToKDS: (ip, port, data) => ipcRenderer.send('send-to-kds', { ip, port, data }),
    sendToAllKDS: (data) => ipcRenderer.send('send-to-all-kds', data),
    onKDSFound: (callback) => {
        ipcRenderer.removeAllListeners('kds-found'); 
        ipcRenderer.on('kds-found', (_, kds) => callback(kds));
    },
    onKDSConnected: (callback) => {
        ipcRenderer.removeAllListeners('kds-connected'); 
        ipcRenderer.on('kds-connected', (_event, data) => callback(data));
    },    
    onKDSError: (callback) => {
        ipcRenderer.removeAllListeners('kds-error');
        ipcRenderer.on('kds-error', (_, errorMessage) => callback(errorMessage));
    },
    onOrderStatus: (callback) => {
        ipcRenderer.removeAllListeners('order-status');
        ipcRenderer.on('order-status', (_, status) => callback(status));
    }, 
    onOrderUpdated: (callback) => {
        ipcRenderer.removeAllListeners('order-updated');
        ipcRenderer.on('order-updated', (_event, data) => callback(data));
    },
    connectPrinter: (printerInfo) => ipcRenderer.invoke('connect-printer', printerInfo), // ✅ FIXED
    getConnectedPrinter: () => ipcRenderer.invoke('get-connected-printer'),
});
