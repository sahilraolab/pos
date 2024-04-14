const { app, BrowserWindow, ipcMain } = require('electron');
const Printer = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const path = require('path'); // Import the path module

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

  ipcMain.on('print-receipt', (event, data) => {
    try {
      // Perform the printing operation
      printReceipt(data);
      // Send a response to the renderer process indicating success
      event.sender.send('print-receipt-response', true);
    } catch (error) {
      // Send a response to the renderer process indicating failure
      console.log("<><><><><><><>")
      console.log(error);
      console.log("<><><><><><><>")
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

// Function to print the receipt
function printReceipt(content) {
  try {
    console.log('Printing receipt...');
    const printer = new Printer({
      type: PrinterTypes.EPSON,
      interface: 'Everycom-80-Series', // Replace 'printer-name' with the name of your printer
      characterSet: 'SLOVENIA',
      removeSpecialCharacters: false,
      replaceSpecialCharacters: true,
      lineCharacter: '-'
    });

    printer.alignCenter();
    printer.println(content);
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

    console.log('Receipt printed successfully');
  } catch (error) {
    console.error('Error here:', error);
    // Handle the error, such as displaying an error message to the user
  }
}
