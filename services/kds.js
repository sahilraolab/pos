const net = require('net');

let kdsSocket;

function setupKDSHandlers(ipcMain) {
    ipcMain.on('dummy-order', (event, order) => {
        console.log('Received dummy order:', order);
        if (!kdsSocket) {
            console.error('KDS socket not initialized');
            return;
        }
        kdsSocket.write(JSON.stringify(order));
        event.reply('dummy-order-come', 'Data sent successfully');
    });

    connectToKDS();
}

function connectToKDS() {
    kdsSocket = net.createConnection({ host: '127.0.0.1', port: 9001 }, () => {
        console.log('Connected to KDS');
    });

    kdsSocket.on('data', (data) => {
        console.log('Received KDS order update:', data.toString());
    });

    kdsSocket.on('error', (err) => {
        console.error('Error with KDS connection:', err);
    });

    kdsSocket.on('close', () => {
        console.log('KDS connection closed');
    });
}

module.exports = { setupKDSHandlers };
