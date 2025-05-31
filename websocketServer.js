const WebSocket = require('ws');
const os = require('os');
const bonjour = require('bonjour')();
const { ipcMain } = require('electron');

let connectedKDSClients = new Map(); // Map<kdsId, ws>

function startWebSocketServer(mainWindow, initialData = {}) {
    const hostname = os.hostname();
    const wss = new WebSocket.Server({ port: 8080 });

    wss.on('connection', (ws, req) => {
        const kdsId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
        console.log(`✅ New KDS connected: ${kdsId}`);

        connectedKDSClients.set(kdsId, ws);

        // Send initial data
        ws.send(JSON.stringify({ type: 'initialData', data: initialData }));

        // Notify renderer
        mainWindow.webContents.send('kds-connected', { kdsId });

        ws.on('message', (message) => {
            try {
                const parsed = JSON.parse(message);
                console.log(parsed);
                console.log(`📨 Message from ${kdsId}:`, parsed);

                switch (parsed.type) {
                    case 'broadcastData':
                        broadcastToAll(parsed.data);
                        break;

                    case 'kds-data':
                        mainWindow.webContents.send('kds-data', { kdsId, data: parsed.data });
                        break;

                    default:
                        console.warn(`⚠️ Unrecognized message type from ${kdsId}:`, parsed.type);
                }
            } catch (err) {
                console.error(`❌ Failed to parse message from ${kdsId}:`, err);
            }
        });

        ws.on('close', () => {
            connectedKDSClients.delete(kdsId);
            console.log(`❎ KDS disconnected: ${kdsId}`);
            mainWindow.webContents.send('kds-disconnected', { kdsId });
        });

        ws.on('error', (err) => {
            console.error(`🔥 Error on KDS ${kdsId}:`, err);
        });
    });

    // IPC: get all connected KDS clients
    ipcMain.handle('get-connected-kds', () => {
        return Array.from(connectedKDSClients.keys());
    });

    // IPC: broadcast data to all KDS clients
    ipcMain.on('broadcast-data', (event, data) => {
        broadcastToAll(data);
    });

    // IPC: send data to a specific KDS
    ipcMain.on('send-data-to-kds', (event, { kdsId, data }) => {
        const ws = connectedKDSClients.get(kdsId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'data', data }));
        }
    });

    // IPC: disconnect a specific KDS
    ipcMain.on('disconnect-kds', (event, kdsId) => {
        const ws = connectedKDSClients.get(kdsId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        connectedKDSClients.delete(kdsId);
    });

    // IPC: disconnect all KDS clients
    ipcMain.on('disconnect-all-kds', () => {
        for (const ws of connectedKDSClients.values()) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }
        connectedKDSClients.clear();
    });

    function broadcastToAll(data) {
        const msg = JSON.stringify({ type: 'data', data });
        for (const [kdsId, ws] of connectedKDSClients.entries()) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(msg);
            }
        }
    }

    // Bonjour publish for auto-discovery
    bonjour.publish({ name: `POS Server - ${hostname}`, type: 'ws', port: 8080 });
    console.log(`📡 Bonjour service published: POS Server - ${hostname} on port 8080`);
}

module.exports = {
    startWebSocketServer,
};
