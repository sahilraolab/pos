const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data), // Ensure invoke is exposed
    send: (channel, data) => ipcRenderer.send(channel, data), // Optional, if needed
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
});
