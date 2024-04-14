function printReceipt() {
  // Receipt content
  const receiptContent = `
    <div style="text-align: center; font-weight: bold;">Sample Receipt</div>
    <div style="text-align: center;">--------------------------</div>
    <div>Item             Qty   Price</div>
    <div>--------------------------</div>
    <div>Product 1         x1    $10.00</div>
    <div>Product 2         x2    $20.00</div>
    <div>--------------------------</div>
    <div style="text-align: right;">Total:           $30.00</div>
    <div style="text-align: center;">--------------------------</div>
  `;
  
  // Send a message to the main process to print the receipt
  window.api.send('print-receipt', receiptContent);
  
  // Listen for response from the main process (if needed)
  window.api.receive('print-receipt-response', (event, message) => {
    console.log(message);
  });
}
