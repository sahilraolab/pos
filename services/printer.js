const net = require('net');

function setupPrinterHandlers(ipcMain) {
    const printerAddress = '192.168.1.23';
    const printerPort = 9100;

    const socket = net.createConnection({ host: printerAddress, port: printerPort }, () => {
        console.log('Connected to printer');
    });

    socket.on('error', (err) => {
        console.error('Printer connection error:', err);
    });

    socket.on('close', () => {
        console.log('Printer connection closed');
    });

    ipcMain.on('print-receipt', (event, receiptContent) => {
        socket.write(receiptContent, (error) => {
            if (error) {
                event.sender.send('print-receipt-response', 'Failed to print.');
            } else {
                const feedAndCutCommand = Buffer.concat([
                    Buffer.from('\x1B\x64\x05'),
                    Buffer.from('\x1D\x56\x00'),
                    Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA])
                ]);
                socket.write(feedAndCutCommand, (cutError) => {
                    if (cutError) {
                        event.sender.send('print-receipt-response', 'Printed successfully, but failed to cut.');
                    } else {
                        event.sender.send('print-receipt-response', 'Printed and cut successfully.');
                    }
                });
            }
        });
    });
}

module.exports = { setupPrinterHandlers };
