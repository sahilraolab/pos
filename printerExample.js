const usb = require('usb');

const VENDOR_ID = 0x0456;
const PRODUCT_ID = 0x0808;

const device = usb.getDeviceList().find(d =>
    d.deviceDescriptor.idVendor === VENDOR_ID &&
    d.deviceDescriptor.idProduct === PRODUCT_ID
);

if (!device) {
    console.log("Printer is NOT connected");
    process.exit(1);
}

console.log("Printer is connected");

try {
    device.open();

    const iface = device.interfaces.find(i =>
        i.endpoints.some(ep => ep.direction === 'out')
    );

    if (!iface) {
        console.error('No interface with OUT endpoint found');
        process.exit(1);
    }

    iface.claim();

    const endpoint = iface.endpoints.find(ep => ep.direction === 'out');

    if (!endpoint) {
        console.error('No OUT endpoint found on the claimed interface');
        process.exit(1);
    }

    const escposData = Buffer.concat([
        Buffer.from('\x1B\x40', 'ascii'),          // Initialize printer
        Buffer.from('Hello from Node.js!\n', 'ascii'),
        Buffer.from('\x0A', 'ascii'),              // Line feed
        Buffer.from('\x1D\x56\x41', 'ascii')       // Cut paper
    ]);

    // Correct buffer for cash drawer open command (pulse to pin 2, 25ms on, 250ms off)
    // const openCashDrawer = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0xFA]);
    const openCashDrawer = Buffer.from([0x1B, 0x70, 0x01, 0x19, 0xFA]);

    // First send print data
    endpoint.transfer(escposData, (error) => {
        if (error) {
            console.error('Error sending print data:', error);
            cleanup();
            return;
        }
        console.log('Print data sent successfully!');

        // Small delay before sending cash drawer command (to ensure printer processes previous data)
        setTimeout(() => {
            endpoint.transfer(openCashDrawer, (err) => {
                if (err) {
                    console.error('Error sending cash drawer command:', err);
                } else {
                    console.log('Cash drawer command sent successfully!');
                }
                cleanup();
            });
        }, 200);  // 200 ms delay (adjust if needed)
    });

    function cleanup() {
        iface.release(true, () => {
            device.close();
        });
    }

} catch (err) {
    console.error('Error:', err);
}
