const { app, BrowserWindow, ipcMain } = require('electron');
const Printer = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // Load your HTML file that contains the print functionality
  mainWindow.loadFile('index.html');

  ipcMain.on('print-receipt', (event, data) => {
    try {
      // Perform the printing operation
      printReceipt(data);
      // Send a response to the renderer process indicating success
      event.sender.send('print-receipt-response', true);
    } catch (error) {
      // Send a response to the renderer process indicating failure
      event.sender.send('print-receipt-response', false);
    }
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

// // Handle printing request from the renderer process
// ipcMain.on('print', (event, receiptContent, printerOptions) => {
//   const printer = new ElectronPrinter();

//   // Print the receipt content
//   printer.print(receiptContent, printerOptions)
//     .then(() => {
//       // Printing successful
//       event.reply('print-success');
//     })
//     .catch((error) => {
//       // Printing failed
//       event.reply('print-error', error);
//     });
// });

// Function to print the receipt
function printReceipt(content) {
  const printer = new Printer({
      type: PrinterTypes.EPSON,
      interface: 'printer-name', // Replace 'printer-name' with the name of your printer
      characterSet: 'SLOVENIA',
      removeSpecialCharacters: false,
      replaceSpecialCharacters: true,
      lineCharacter: '-'
  });

  printer.alignCenter();
  printer.println('Sample Receipt');
  printer.drawLine();
  printer.alignLeft();
  printer.table(["Item", "Qty", "Price"]);
  printer.drawLine();
  printer.tableCustom([
      { text: "Product 1", align: "LEFT", width: 0.5 },
      { text: "x1", align: "CENTER", width: 0.25 },
      { text: "$10.00", align: "RIGHT", width: 0.25 }
  ]);
  printer.tableCustom([
      { text: "Product 2", align: "LEFT", width: 0.5 },
      { text: "x2", align: "CENTER", width: 0.25 },
      { text: "$20.00", align: "RIGHT", width: 0.25 }
  ]);
  printer.drawLine();
  printer.alignRight();
  printer.println('Total: $30.00');
  printer.drawLine();

  printer.cut();
  printer.execute();
}