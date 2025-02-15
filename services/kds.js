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
                try { client.close(); } catch (_) { } // Safe close
            });

            client.bind(() => {
                client.setBroadcast(true);
                client.send('DISCOVER_KDS', UDP_PORT, BROADCAST_IP);
            });

            let socketClosed = false; // Track socket state

            client.on('message', (msg, rinfo) => {
                try {
                    const kdsInfo = JSON.parse(msg.toString());

                    event.reply('kds-found', {
                        name: kdsInfo.kds_name,
                        department: kdsInfo.department,
                        ip: kdsInfo.ip,
                        port: kdsInfo.port
                    });
                } catch (parseError) {
                    console.error('Failed to parse KDS response:', parseError);
                    event.reply('kds-error', 'Invalid KDS response format');
                } finally {
                    if (!socketClosed) {
                        try { client.close(); socketClosed = true; } catch (_) { }
                    }
                }
            });

            setTimeout(() => {
                if (!socketClosed) {
                    try { client.close(); socketClosed = true; } catch (_) { }
                }
            }, 3000); // Close after timeout if no response

        } catch (error) {
            console.error('Scan KDS Error:', error);
            event.reply('kds-error', error.message);
        }
    });

    ipcMain.on('connect-kds', (event, { kdsInfo, password }) => {
        try {
            console.log(`🛠 Attempting to connect to KDS at ${kdsInfo.ip}:${kdsInfo.port}`);

            if (!password || typeof password !== 'string') {
                console.error("🚨 Error: Password is required and must be a string.");
                event.reply('kds-error', 'Password is required.');
                return;
            }

            // Close previous connection if exists
            if (kdsSocket) {
                console.log('🔌 Closing previous KDS connection...');
                kdsSocket.destroy();
                kdsSocket = null;
            }

            kdsSocket = net.createConnection({ host: kdsInfo.ip, port: kdsInfo.port }, () => {
                console.log(`✅ Successfully connected to KDS: ${kdsInfo.name} (${kdsInfo.department})`);

                // Send password after connection
                console.log(`🔑 Sending password to KDS: ${password}`);
                kdsSocket.write(password + '\n');

                kdsSocket.on('data', (data) => {
                    const response = data.toString().trim();
                    console.log(`📨 Received response from KDS: ${response}`);

                    if (response === "AUTH_SUCCESS") {
                        event.reply('kds-connected', `Connected to ${kdsInfo.name} (${kdsInfo.department})`);
                    } else {
                        console.log('🚨 Authentication failed. Closing socket.');

                        // 🔥 FIX: Ensure socket exists before calling `.end()`
                        if (kdsSocket && typeof kdsSocket.end === 'function') {
                            kdsSocket.end();
                        }
                
                        // Notify renderer process about auth failure
                        event.reply('kds-error', '❌ Wrong password. Authentication failed.');
                    }
                });
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

    // ipcMain.on('connect-kds', (event, kdsInfo, password) => {
    //     try {
    //         if (!password) {
    //             event.reply('kds-error', 'Password is required to connect.');
    //             return;
    //         }

    //         if (kdsSocket) {
    //             console.log('Closing previous KDS connection...');
    //             kdsSocket.destroy();
    //             kdsSocket = null;
    //         }

    //         kdsSocket = net.createConnection({ host: kdsInfo.ip, port: kdsInfo.port }, () => {
    //             console.log(`✅ Connected to KDS: ${kdsInfo.name} (${kdsInfo.department})`);

    //             // Send password for authentication
    //             kdsSocket.write(password);

    //             kdsSocket.on('data', (data) => {
    //                 const response = data.toString().trim();
    //                 if (response === "AUTH_SUCCESS") {
    //                     event.reply('kds-connected', `Connected to ${kdsInfo.name} (${kdsInfo.department})`);
    //                 } else {
    //                     kdsSocket.end();
    //                     event.reply('kds-error', 'Incorrect password');
    //                 }
    //             });
    //         });

    //         kdsSocket.on('error', (err) => {
    //             console.error('KDS Connection Error:', err);
    //             event.reply('kds-error', 'KDS Connection Error: ' + err.message);
    //         });

    //         kdsSocket.on('close', () => {
    //             console.log('KDS Disconnected');
    //             event.reply('kds-disconnected', 'KDS Disconnected');
    //             kdsSocket = null;
    //         });

    //     } catch (error) {
    //         console.error('Connect KDS Error:', error);
    //         event.reply('kds-error', error.message);
    //     }
    // });
}

module.exports = { setupKDSHandlers };