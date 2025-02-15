const net = require('net');
const dgram = require('dgram');

let kdsSocket = null;
const UDP_PORT = 9999;
const BROADCAST_IP = '255.255.255.255';

function setupKDSHandlers(ipcMain) {
    ipcMain.on('scan-kds', (event) => {
        try {
            const client = dgram.createSocket('udp4');
    
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
                    if (!discoveredKDS.some(kds => kds.ip === kdsInfo.ip && kds.port === kdsInfo.port)) {
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
                try { client.close(); } catch (_) { }
            }, 5000); // Increase timeout to 5 seconds
    
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

    ipcMain.on('disconnect-kds', (event) => {
        if (kdsSocket) {
            console.log('🔌 Manually disconnecting from KDS.');
            kdsSocket.destroy();
            kdsSocket = null;
            event.reply('kds-disconnected', 'KDS connection closed.');
        }
    });
}

module.exports = { setupKDSHandlers };