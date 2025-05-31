// printerHandlers.js
const { ipcMain } = require('electron');
const usb = require('usb');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

let store;

async function registerPrinterHandlers(getStore) {
  store = getStore();

  // List USB printers by scanning USB devices and filtering (basic)
  ipcMain.handle('get-printers', async () => {
    const devices = usb.getDeviceList();

    // Return devices info (vendorId/productId)
    return devices.map(device => {
      const { idVendor, idProduct } = device.deviceDescriptor;
      return {
        vendorId: idVendor,
        productId: idProduct,
        vendorIdHex: idVendor.toString(16),
        productIdHex: idProduct.toString(16),
      };
    });
  });

  ipcMain.handle('set-default-printer', (event, printer) => {
    store.set('defaultPrinter', printer);
    return true;
  });

  ipcMain.handle('get-default-printer', () => {
    return store.get('defaultPrinter') || null;
  });

  ipcMain.handle('print-default', async (event, content = 'Test Print') => {
    try {
      const defaultPrinter = store.get('defaultPrinter');
      if (!defaultPrinter) throw new Error('No default printer set');

      // Construct USB interface string for node-thermal-printer
      // Format: 'usb://vendorId/productId' e.g. usb://0x1234/0x5678
      const interfaceStr = `usb://${defaultPrinter.vendorId}/${defaultPrinter.productId}`;

      console.log(interfaceStr);

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Or 'STAR' based on your printer brand
        interface: interfaceStr,
        options: {
          timeout: 5000,
        },
      });


      console.log(printer);

      const isConnected = await printer.isPrinterConnected();
      if (!isConnected) throw new Error('USB printer not connected');

      printer.alignCenter();
      printer.println(content);
      printer.cut();

      await printer.execute();

      return { success: true };
    } catch (err) {
      console.error('Print Error:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('set-network-printer', (event, ip, port = 9100) => {
    store.set('networkPrinter', { ip, port });
    return true;
  });

  ipcMain.handle('get-network-printer', () => {
    return store.get('networkPrinter') || null;
  });

  ipcMain.handle('print-network', async (event, content = 'Network Test Print') => {
    try {
      const printerInfo = store.get('networkPrinter');
      if (!printerInfo || !printerInfo.ip) throw new Error('No network printer set');

      const interfaceStr = `tcp://${printerInfo.ip}:${printerInfo.port}`;

      const printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: interfaceStr,
        options: {
          timeout: 5000,
        },
      });

      const isConnected = await printer.isPrinterConnected();
      if (!isConnected) throw new Error('Network printer not connected');

      printer.alignCenter();
      printer.println(content);
      printer.cut();

      await printer.execute();

      return { success: true };
    } catch (err) {
      console.error('Network Print Error:', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerPrinterHandlers };
