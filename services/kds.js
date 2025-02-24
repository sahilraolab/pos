const net = require('net');
const dgram = require('dgram');

let kdsConnections = {}; // Store multiple KDS connections
const UDP_PORT = 9999;
const BROADCAST_IP = '255.255.255.255';

function setupKDSHandlers(ipcMain) {
    ipcMain.on('scan-kds', (event) => {
        try {
            let client;
            if (client) {
                try { client.close(); } catch (_) { }
            }
            client = dgram.createSocket('udp4');

            client.on('error', (err) => {
                console.error('UDP Socket Error:', err);
                event.reply('kds-error', 'UDP Socket Error: ' + err.message);
                try { client.close(); } catch (_) { }
            });

            client.bind(() => {
                client.setBroadcast(true);
                client.send('DISCOVER_KDS', UDP_PORT, BROADCAST_IP);
                console.log('🔍 Sent KDS discovery request...');
            });

            let discoveredKDS = [];

            client.on('message', (msg, rinfo) => {
                console.log(`📩 Received response from ${rinfo.address}:${rinfo.port} → ${msg.toString()}`);

                try {
                    const kdsInfo = JSON.parse(msg.toString());

                    if (!discoveredKDS.some(kds => kds.ip === kdsInfo.ip && kds.port === kdsInfo.port)) {
                        discoveredKDS.push(kdsInfo);

                        console.log(`✅ New KDS found: ${kdsInfo.kds_name} (${kdsInfo.department}) at ${kdsInfo.ip}:${kdsInfo.port}`);

                        event.sender.send('kds-found', {
                            name: kdsInfo.kds_name,
                            department: kdsInfo.department,
                            ip: kdsInfo.ip,
                            port: kdsInfo.port
                        });
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse KDS response:', parseError);
                    event.reply('kds-error', 'Invalid KDS response format');
                }
            });

            setTimeout(() => {
                console.log('🛑 Closing UDP socket after waiting for responses...');
                client.removeAllListeners();
                try { client.close(); } catch (_) { }
            }, 10000);

        } catch (error) {
            console.error('🚨 Scan KDS Error:', error);
            event.reply('kds-error', error.message);
        }
    });

    ipcMain.on('connect-kds', (event, kdsInfo) => {
        try {
            console.log('============================')
            console.log(kdsInfo);
            console.log('============================')
            const key = `${kdsInfo.ip}:${kdsInfo.port}`;

            if (kdsConnections[key]) {
                console.log(`🔄 Already connected to KDS at ${key}.`);
                event.reply('kds-connected', kdsInfo);
                return;
            }

            console.log(`🛠 Connecting to KDS at ${kdsInfo.ip}:${kdsInfo.port}`);

            const kdsSocket = net.createConnection({ host: kdsInfo.ip, port: kdsInfo.port }, () => {
                kdsConnections[key] = kdsSocket;
                console.log(`✅ Successfully connected to KDS: ${key}`);
                event.reply('kds-connected', kdsInfo);
            });

            // 🔥 Listen for messages from KDS
            kdsSocket.on('data', (data) => {
                console.log(`📩 Received data from KDS ${key}:`, data.toString());

                try {
                    const orderData = JSON.parse(data.toString());
                    if (orderData.orderId && orderData.status === "done") {

                        event.sender.send('order-updated', {
                            order_id: orderData.orderId,
                            status: "done"
                        });

                        // ✅ Update the database or UI in your POS
                        updateOrderStatus(orderData.order_id, "Completed");
                    }
                } catch (error) {
                    console.error("❌ Error parsing KDS message:", error);
                }
            });


            kdsSocket.on('error', (err) => {
                console.error(`❌ KDS Connection Error (${key}):`, err);
                event.reply('kds-error', `KDS Connection Error: ${err.message}`);
            });

            kdsSocket.on('close', () => {
                console.log(`🔌 KDS Disconnected: ${key}`);
                delete kdsConnections[key];
                event.reply('kds-disconnected', kdsInfo);
            });

        } catch (error) {
            console.error('❌ Connect KDS Error:', error);
            event.reply('kds-error', error.message);
        }
    });

    ipcMain.on('disconnect-kds', (event, kdsInfo) => {
        const key = `${kdsInfo.ip}:${kdsInfo.port}`;
        console.log(`🔴 Disconnecting KDS: ${key}`);

        if (kdsConnections[key]) {
            kdsConnections[key].destroy();
            delete kdsConnections[key];
            console.log(`✅ KDS ${key} disconnected.`);
            event.reply('kds-disconnected', kdsInfo);
        } else {
            console.warn(`⚠️ No active connection found for KDS ${key}.`);
        }
    });

    ipcMain.on('send-to-kds', (event, { ip, port, data }) => {
        sendToKDS(ip, port, data);
    });

    ipcMain.on('send-to-all-kds', (event, data) => {
        sendToAllKDS(data);
    });
}

function sendToKDS(ip, port, data) {
    const key = `${ip}:${port}`;

    if (kdsConnections[key]) {
        console.log(`📤 Sending data to KDS ${key}:`, data);
        kdsConnections[key].write(JSON.stringify(data));
    } else {
        console.warn(`⚠️ KDS ${key} not connected.`);
    }
}

function sendToAllKDS(data) {
    console.log(`📤 Broadcasting data to all KDS devices...`);

    Object.values(kdsConnections).forEach(socket => {
        if (socket && !socket.destroyed) {
            socket.write(JSON.stringify(data));
        }
    });
}

// ✅ Function to Update Order Status in POS
function updateOrderStatus(orderId, status) {
    console.log(`🔄 Updating order ${orderId} to status: ${status}`);

    // Replace this with your actual UI or database update logic
    // Example: Send this update to the frontend UI of the POS
}

module.exports = { setupKDSHandlers };
