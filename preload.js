const { ipcRenderer, contextBridge } = require('electron');

// Expose ipcRenderer directly
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

// Expose specific methods of ipcRenderer
contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(args))
});
