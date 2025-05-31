const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');

let defaultPrinter = null; // stores { type: 'usb' | 'network', interface: 'usb://...', host, port }

/**
 * Abstract printer operations
 */
const printerAPI = {
  /**
   * Mocked USB printer list — replace with real implementation if needed
   */
  listUSB: async () => {
    return [
      { vendorId: 1110, productId: 2056, interface: 'usb://1110/2056', type: 'usb' }
    ];
  },

  /**
   * Set default printer (USB or network)
   * @param {Object} printer - must include type ('usb' | 'network') and appropriate fields
   */
  setDefault: async (printer) => {
    if (!printer || !printer.type) throw new Error('Printer object must include a type');

    if (printer.type === 'usb' && !printer.interface) {
      throw new Error('USB printer must have an interface');
    }

    if (printer.type === 'network' && (!printer.host || !printer.port)) {
      throw new Error('Network printer must have host and port');
    }

    defaultPrinter = printer;
  },

  /**
   * Get the currently set default printer
   */
  getDefault: async () => {
    return defaultPrinter;
  },

  /**
   * Print using the default printer
   * @param {string} data - Raw string to print
   */
  print: async (data) => {
    if (!defaultPrinter) {
      return { success: false, error: 'No default printer set' };
    }

    let printer;

    try {
      const baseConfig = {
        type: PrinterTypes.EPSON,
        width: 48,
        options: { timeout: 5000 },
      };

      if (defaultPrinter.type === 'usb') {
        printer = new ThermalPrinter({
          ...baseConfig,
          interface: defaultPrinter.interface,
        });
      } else if (defaultPrinter.type === 'network') {
        const netInterface = `tcp://${defaultPrinter.host}:${defaultPrinter.port}`;
        printer = new ThermalPrinter({
          ...baseConfig,
          interface: netInterface,
        });
      } else {
        throw new Error('Unsupported printer type');
      }

      printer.clear();
      printer.println(data);
      printer.cut();

      const result = await printer.execute();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message || error.toString() };
    }
  }
};

module.exports = printerAPI;
