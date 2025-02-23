const net = require('net');
const dgram = require('dgram');

let kdsSocket = null;
const kdsConnections = {}; // Global object to store KDS connections
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

            let discoveredKDS = [];  // Store multiple KDS responses

            client.on('message', (msg, rinfo) => {
                console.log(`📩 Received response from ${rinfo.address}:${rinfo.port} → ${msg.toString()}`);

                try {
                    const kdsInfo = JSON.parse(msg.toString());

                    // Prevent duplicate KDS entries
                    if (!discoveredKDS.some(kds => kds.ip === kdsInfo.ip && kds.port === kdsInfo.port && kds.name === kdsInfo.kds_name)) {
                        discoveredKDS.push(kdsInfo);

                        console.log(`✅ New KDS found: ${kdsInfo.kds_name} (${kdsInfo.department}) at ${kdsInfo.ip}:${kdsInfo.port}`);

                        // Use event.sender.send instead of event.reply to allow multiple responses
                        event.sender.send('kds-found', {
                            name: kdsInfo.kds_name,
                            department: kdsInfo.department,
                            ip: kdsInfo.ip,
                            port: kdsInfo.port
                        });
                    } else {
                        console.log(`⚠️ Duplicate KDS ignored: ${kdsInfo.kds_name} (${kdsInfo.department}) at ${kdsInfo.ip}:${kdsInfo.port}`);
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse KDS response:', parseError);
                    event.reply('kds-error', 'Invalid KDS response format');
                }
            });

            // Keep the socket open longer to capture multiple responses
            setTimeout(() => {
                console.log('🛑 Closing UDP socket after waiting for responses...');
                client.removeAllListeners(); // Prevent memory leaks
                try { client.close(); } catch (_) { }
            }, 10000); // Increased to 10 seconds            

        } catch (error) {
            console.error('🚨 Scan KDS Error:', error);
            event.reply('kds-error', error.message);
        }
    });


    ipcMain.on('connect-kds', (event, kdsInfo) => {
        try {
            console.log(`🛠 Attempting to connect to KDS at ${kdsInfo.ip}:${kdsInfo.port}`);

            if (kdsSocket) {
                console.log('🔌 Closing previous KDS connection...');
                kdsSocket.destroy();
                kdsSocket = null;
            }

            kdsSocket = net.createConnection({ host: kdsInfo.ip, port: kdsInfo.port }, () => {
                console.log(kdsInfo);
                kdsConnections[`${kdsInfo.ip}:${kdsInfo.port}`] = kdsSocket;
                console.log(`✅ Successfully connected to KDS: ${kdsInfo.ip} (${kdsInfo.port})`);
                event.reply('kds-connected', kdsInfo);
            });

            kdsSocket.on('error', (err) => {
                console.error('❌ KDS Connection Error:', err);
                event.reply('kds-error', 'KDS Connection Error: ' + err.message);
            });

            kdsSocket.on('close', () => {
                console.log('🔌 KDS Disconnected');
                event.reply('kds-disconnected', 'KDS Disconnected');
                kdsSocket = null;
            });

        } catch (error) {
            console.error('❌ Connect KDS Error:', error);
            event.reply('kds-error', error.message);
        }
    });


    ipcMain.on('disconnect-kds', (event, kds) => {
        console.log(`Received disconnect request for KDS: ${kds.ip}:${kds.port}`);

        // Implement your logic to disconnect KDS from the POS
        disconnectKDSFromPOS(kds.ip, kds.port);

        event.reply('kds-disconnected', kds); // Inform renderer that KDS is disconnected
    });

}

function disconnectKDSFromPOS(ip, port) {
    console.log(`🔴 Disconnecting KDS at ${ip}:${port} from POS...`);
    console.log('MR. SAHIL HERE IS ALL FINE');

    if (!kdsConnections || typeof kdsConnections !== 'object') {
        console.warn(`⚠️ kdsConnections is not initialized or is not an object.`);
        return;
    }

    const key = `${ip.trim()}:${port}`;
    console.log(`🔍 Checking kdsConnections for key: ${key}`);
    console.log(`Available keys:`, Object.keys(kdsConnections));

    if (kdsConnections[key]) {
        console.log('MR. SAHIL HERE IS ALL FINE 2');
        console.log(`Existing connection found:`, kdsConnections[key]);

        if (kdsConnections[key].destroy && typeof kdsConnections[key].destroy === 'function') {
            if (!kdsConnections[key].destroyed) {
                console.log(`Destroying connection for ${key}`);
                kdsConnections[key].destroy();
            }
        } else {
            console.warn(`⚠️ Connection object for ${key} does not have a destroy method.`);
        }

        delete kdsConnections[key];
        console.log(`✅ Connection for ${key} deleted.`);
    } else {
        console.warn(`⚠️ No active connection found for KDS ${key}.`);
    }
}


module.exports = { setupKDSHandlers };