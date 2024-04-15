const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path'); // Import the path module
const net = require('net');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      // preload: path.join(app.getAppPath(), 'preload.js')
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load your HTML file that contains the print functionality
  mainWindow.loadFile('index.html');

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
          THERMAL PRINTER CONNECTION WITH IP
   ============================================================== */

// IP address and port of the thermal printer
const printerAddress = '192.168.1.23'; // Replace with the printer's IP address
const printerPort = 9100; // Default port for most thermal printers

// Create a socket connection to the printer
const socket = net.createConnection({ host: printerAddress, port: printerPort }, () => {
  console.log('Connected to printer');
});

// Handle errors and close events
socket.on('error', (err) => {
  console.error('Error:', err);
});

socket.on('close', () => {
  console.log('Connection closed');
});

// Listen for events from the renderer process to print
ipcMain.on('print-receipt', (event, receiptContent) => {
  // Send the receipt content to the printer
  socket.write(receiptContent, (error) => {
    if (error) {
      event.sender.send('print-receipt-response', 'Failed to print.');
    } else {
      // Send ESC/POS command for auto-cutting
      const autoCutCommand = Buffer.from([0x1D, 0x56, 0x00]); // ESC/POS command for full cut
      socket.write(autoCutCommand, (cutError) => {
        if (cutError) {
          console.log('<><><><><><><><>')
          console.log(cutError);
          console.log('<><><><><><><><>')
          event.sender.send('print-receipt-response', 'Printed successfully, but failed to cut.');
        } else {
          console.log("I'm here buddy, where you finding me !")
          event.sender.send('print-receipt-response', 'Printed and cut successfully.');
        }
      });
    }
  });
});




// // Listen for events from the renderer process to print
// ipcMain.on('print-receipt', (event, data) => {
//   if (!printerPort) {
//     event.sender.send('print-receipt-response', 'Printer not connected.');
//     return;
//   }

//   // Format the data as needed for printing
//   const formattedData = formatDataForPrinting(data);

//   // Send the formatted data to the printer
//   printerPort.write(formattedData, (error) => {
//     if (error) {
//       event.sender.send('print-receipt-response', 'Failed to print.');
//     } else {
//       event.sender.send('print-receipt-response', 'Printed successfully.');
//     }
//   });
// });

// // Open the serial port connection to the printer
// function openPrinterPort() {
//   SerialPort.list().then((ports) => {
//     // Find the port corresponding to your printer
//     const printerPortInfo = ports.find((portInfo) => {
//       return portInfo.vendorId === 'your_vendor_id' && portInfo.productId === 'your_product_id';
//     });

//     if (printerPortInfo) {
//       printerPort = new SerialPort(printerPortInfo.path, { baudRate: 9600 });
//     } else {
//       console.error('Printer not found.');
//     }
//   }).catch((error) => {
//     console.error('Error listing serial ports:', error);
//   });
// }

// function formatDataForPrinting() {
//   // Hardcoded order summary data
//   const orderSummary = {
//     items: [
//       { name: "Pizza", qty: 2, price: "$10.00" },
//       { name: "Burger", qty: 1, price: "$5.00" },
//       { name: "Fries", qty: 1, price: "$3.00" }
//     ],
//     total: "$28.00"
//   };

//   // Format the data for printing
//   let formattedData = '';

//   // Add header
//   formattedData += 'Order Summary\n';
//   formattedData += '--------------------------\n';

//   // Add items
//   orderSummary.items.forEach(item => {
//     formattedData += `${item.name}\t\t${item.qty}\t\t${item.price}\n`;
//   });

//   // Add footer
//   formattedData += '--------------------------\n';
//   formattedData += `Total: ${orderSummary.total}\n`;

//   return formattedData;
// }


// // Call the function to open the printer port when the app is ready
// app.on('ready', openPrinterPort);
