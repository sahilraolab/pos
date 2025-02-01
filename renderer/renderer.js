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

  // Listen for response from the main process
  window.api.receive('print-receipt-response', (event, message) => {
    console.log(message);
  });
}

function sendDummyOrder() {
  // let data = prompt("Enter name", "sr");
  const dummyOrder = {
    name: "sar",
    type: "Quick Bill",
    id: "001",
    items: [
      { item: 'Burger', quantity: 2 },
      { item: 'Pizza', quantity: 1 },
      { item: 'Salad', quantity: 1 }
    ]
  }

  // Send the dummy order to the main process
  window.api.send('dummy-order', dummyOrder);
}

// Function to send order details to main.js
async function saveOrderDetails(orderDetails) {
  console.log(orderDetails);
  const result = await window.api.send('save-order', orderDetails);
  console.log(result);
  return result.success;
}

// Function to fetch orders from main.js
async function fetchOrders() {
  try {
    const result = await window.api.send('fetch-orders');
    if (result.success) {
      console.log('Fetched Orders:', result.data);
    } else {
      console.error('Error fetching orders:', result.error);
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

// Call the function to fetch and display orders in the console
fetchOrders();


//=================================================================//



// // Listen for the confirmation message from the main process
// window.api.receive("dummy-order-come", (event, message) => {
//   console.log(message);
// });