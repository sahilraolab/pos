const { ipcMain } = require('electron');
const net = require('net');

function setupPrinterHandlers(ipcMain) {
    let printerSocket = null;

    ipcMain.handle('connect-printer', async (_event, { ip, port }) => { // ✅ Ensure handler exists
        console.log(`Connecting to printer at ${ip}:${port}`);
        
        return new Promise((resolve, reject) => {
            if (printerSocket) {
                printerSocket.destroy(); // Close existing connection
            }

            printerSocket = net.createConnection({ host: ip, port }, () => {
                console.log(`Connected to printer at ${ip}:${port}`);
                resolve({ status: 'connected', ip, port });
            });

            printerSocket.on('error', (err) => {
                console.error('Printer connection error:', err);
                reject(new Error(err.message)); // Ensure it's a proper Error object
            });

            printerSocket.on('close', () => {
                console.log('Printer connection closed');
                printerSocket = null;
            });
        });
    });

    ipcMain.handle('get-connected-printer', () => { // ✅ Ensure this exists
        return printerSocket
            ? { status: 'connected', ip: printerSocket.remoteAddress, port: printerSocket.remotePort }
            : { status: 'disconnected' };
    });
}

module.exports = { setupPrinterHandlers };
