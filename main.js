const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path'); // Import the path module
const net = require('net');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });


  // Load your HTML file that contains the print functionality
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.webContents.on('did-finish-load', () => {
    // Set the zoom level to 100% (zoom level 0)
    mainWindow.webContents.setZoomLevel(-0.1);
  });

  // Intercept and prevent zoom shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.key === '=' || input.key === '-' || input.key === '0') && (input.control || input.meta)) {
      event.preventDefault();
    }
    // if ((input.key === 'R' && input.control) || (input.key === 'r' && input.meta) || input.key === 'F5') {
    //   event.preventDefault();
    // }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});




/* ==============================================================
            DATABASE APIS START HERE
============================================================== */

const ordersDatabase = [];

// Handle saving orders
ipcMain.handle('save-order', async (event, orderDetails) => {
  try {
    // Save order details (you can replace this with actual database logic)
    ordersDatabase.push(orderDetails);
    console.log("+++++++++++++")
    return { success: true, message: 'Order saved successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to save order' };
  }
});

// Handle fetching orders
ipcMain.handle('fetch-orders', async (event) => {
  try {
    // Fetch orders from database (replace with actual database logic)
    return { success: true, data: ordersDatabase };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' };
  }
});



/* ==============================================================
            DATABASE APIS END HERE
============================================================== */







/* ==============================================================
          KDS CONNECT WITH IP
   ============================================================== */

// Create a socket connection to the KDS
// const kdsAddress = '127.0.0.1'; // Replace with the IP address of the KDS
// const kdsPort = 9001; // Specify the port the KDS is listening on
// const kdsSocket = net.createConnection({ host: kdsAddress, port: kdsPort }, () => {
//   console.log('Connected to KDS');
// });

// ipcMain.on('dummy-order', (event, order) => {
//   // Process the dummy order
//   console.log('Received dummy order:', order);
//   // Send the order to the KDS
//   kdsSocket.write(JSON.stringify(order));

//   event.sender.send('dummy-order-come', "Data send successfully");
// });

// kdsSocket.on('data', (data) => {
//   console.log('Received KDS order update:', data.toString());
// });


// Start KDS connection
function connectToKDS() {
  kdsSocket = net.createConnection({ host: '127.0.0.1', port: 9001 }, () => {
    console.log('Connected to KDS');
  });

  kdsSocket.on('data', (data) => {
    console.log('Received KDS order update:', data.toString());
  });
}

ipcMain.on('dummy-order', (event, order) => {
  console.log('Received dummy order:', order);
  if (!kdsSocket) {
    console.error('KDS socket not initialized');
    return;
  }
  kdsSocket.write(JSON.stringify(order));
  event.reply('dummy-order-come', "Data sent successfully");
});

// Initialize KDS connection when the app is ready
// app.on('ready', connectToKDS);



/* ==============================================================
          THERMAL PRINTER CONNECTION WITH IP
   ============================================================== */

// // IP address and port of the thermal printer
// const printerAddress = '192.168.1.23'; // Replace with the printer's IP address
// const printerPort = 9100; // Default port for most thermal printers

// // Create a socket connection to the printer
// const socket = net.createConnection({ host: printerAddress, port: printerPort }, () => {
//   console.log('Connected to printer');
// });

// // Handle errors and close events
// socket.on('error', (err) => {
//   console.error('Error:', err);
// });

// socket.on('close', () => {
//   console.log('Connection closed');
// });

// // Listen for events from the renderer process to print
// ipcMain.on('print-receipt', (event, receiptContent) => {
//   // Send the receipt content to the printer
//   socket.write(receiptContent, (error) => {
//     if (error) {
//       event.sender.send('print-receipt-response', 'Failed to print.');
//     } else {
//       // Send ESC/POS command for auto-cutting
//       // const autoCutCommand = Buffer.from([0x1D, 0x56, 0x00]); // ESC/POS command for full cut
//       // const partialCutCommand = Buffer.from([0x1D, 0x56, 0x01]); // ESC/POS command for partial cut
//       const feedAndCutCommand = Buffer.concat([
//         Buffer.from('\x1B\x64\x05'), // Feed 5 lines
//         Buffer.from('\x1D\x56\x00'),  // Full cut
//         Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]) // Open cash drawer
//       ]);
//       socket.write(feedAndCutCommand, (cutError) => {
//         if (cutError) {
//           console.log('<><><><><><><><>')
//           console.log(cutError);
//           console.log('<><><><><><><><>')
//           event.sender.send('print-receipt-response', 'Printed successfully, but failed to cut.');
//         } else {
//           console.log("I'm here buddy, where you finding me !")
//           event.sender.send('print-receipt-response', 'Printed and cut successfully.');
//         }
//       });
//     }
//   });
// });


