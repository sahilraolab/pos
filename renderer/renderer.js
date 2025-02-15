document.addEventListener('DOMContentLoaded', () => {
  const kdsList = document.getElementById('kdsList');

  window.electronAPI.onKDSFound((kds) => {
    const kdsDiv = document.createElement('div');
    kdsDiv.innerHTML = `
      <div
        style="gap: 1rem; background-color: white; padding: 1rem; display: flex; flex-direction: column; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; border-radius: 20px;">
        <h1 style="font-size: 18px; color: #2B2B2B; font-weight: 500;">${kds.name}</h1>
        <p style="font-size: 14px; color: #2B2B2B;"><span>Kitchen Department</span>:&nbsp;<span>${kds.department}</span></p>
        <input type="password" class="kds-password" placeholder="Enter password" />
        <button data-ip="${kds.ip}" data-port="${kds.port}"
        class="connect-btn"
            style="align-self: flex-start; border-radius: 20px; font-size: 16px; color: white; border: none; padding: 0.6rem 1rem; background: linear-gradient(#EFA280, #DF6229);">Connect</button>
    </div>
    `;
    kdsList.appendChild(kdsDiv);
  });

  kdsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('connect-btn')) {
      const kdsDiv = event.target.parentElement;
      const ip = event.target.getAttribute('data-ip');
      const port = parseInt(event.target.getAttribute('data-port'), 10);
      const passwordInput = kdsDiv.querySelector('.kds-password');
      const password = passwordInput ? passwordInput.value.trim() : '';
      console.log(password);
      if (!password || password.length === 0) {
        alert('⚠️ Please enter a password before connecting!');
        return;
      }

      console.log(`🔵 Trying to connect to KDS: ${ip}:${port} with password: ${password}`);
      window.electronAPI.connectKDS({ ip, port }, password);
    }
  });

  window.electronAPI.onKDSConnected(() => {
    alert('✅ Connected to KDS');
  });

  window.electronAPI.onKDSError((errorMessage) => {
    alert(`❌ KDS Error: ${errorMessage}`);
  });

  window.electronAPI.onOrderStatus((status) => {
    alert(`📦 Order Update: ${status}`);
  });
});




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
  try {
    const result = await window.api.invoke('save-order', orderDetails); // Use invoke
    console.log('Response from main:', result);
    return result?.success ?? false;
  } catch (error) {
    console.error("Error saving order:", error);
    return false;
  }
}


async function fetchOrders() {
  try {
    const result = await window.api.invoke('fetch-orders'); // ✅ Use invoke instead of send

    if (result?.success) {
      console.log('Fetched Orders:', result.data);
    } else {
      console.error('Error fetching orders:', result?.error || 'Unknown error');
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}


// Call the function to fetch and display orders in the console
fetchOrders();


function fetchKdsScreens() {
  const kdsList = document.getElementById('kdsList');
  kdsList.innerHTML = ''; // Clear previous results
  window.electronAPI.scanKDS();
  window.electronAPI.onKDSFound((kds) => {
    const kdsDiv = document.createElement('div');
    kdsDiv.innerHTML = `
      <div
        style="gap: 1rem; background-color: white; padding: 1rem; display: flex; flex-direction: column; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; border-radius: 20px;">
        <h1 style="font-size: 18px; color: #2B2B2B; font-weight: 500;">${kds.name}</h1>
        <p style="font-size: 14px; color: #2B2B2B;"><span>Kitchen Department</span>:&nbsp;<span>${kds.department}</span></p>
        <input type="password" class="kds-password" placeholder="Enter password" />
        <button data-ip="${kds.ip}" data-port="${kds.port}"
        class="connect-btn"
            style="align-self: flex-start; border-radius: 20px; font-size: 16px; color: white; border: none; padding: 0.6rem 1rem; background: linear-gradient(#EFA280, #DF6229);">Connect</button>
    </div>
    `;
    kdsList.appendChild(kdsDiv);
  });
}


//=================================================================//



// // Listen for the confirmation message from the main process
// window.api.receive("dummy-order-come", (event, message) => {
//   console.log(message);
// });