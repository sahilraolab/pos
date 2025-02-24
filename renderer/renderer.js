// document.addEventListener('DOMContentLoaded', () => {
  // const kdsList = document.getElementById('kdsList');

  // // Function to render KDS devices
  // function renderKDS(kds) {
  //   const existingKDS = document.querySelector(`[data-ip="${kds.ip}"][data-port="${kds.port}"]`);
  //   if (existingKDS) return; // Avoid duplicate entries

  //   const kdsDiv = document.createElement('div');
  //   kdsDiv.setAttribute('data-ip', kds.ip);
  //   kdsDiv.setAttribute('data-port', kds.port);

  //   kdsDiv.innerHTML = `
  //     <div style="gap: 1rem; background-color: white; padding: 1rem; display: flex; flex-direction: column; 
  //     box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; border-radius: 20px;">

  //       <h1 style="font-size: 18px; color: #2B2B2B; font-weight: 500;">${kds.name}</h1>
  //       <p style="font-size: 14px; color: #2B2B2B;">
  //         <span>Kitchen Department</span>:&nbsp;<span>${kds.department}</span>
  //       </p>
  //       <button data-ip="${kds.ip}" data-port="${kds.port}" class="connect-btn"
  //         style="align-self: flex-start; border-radius: 20px; font-size: 16px; color: white; border: none; 
  //         padding: 0.6rem 1rem; background: linear-gradient(#EFA280, #DF6229);">
  //         Connect
  //       </button>
  //     </div>
  //   `;
  //   kdsList.appendChild(kdsDiv);
  // }

  // // Scan for available KDS devices when the user navigates to the screen
  // function fetchKdsScreens(interval = 10000) {
  //   console.log("🔍 Scanning for KDS screens...");

  //   const connectedKDS = new Set(); // Store already connected KDS

  //   function scan() {
  //     window.electronAPI.scanKDS();

  //     window.electronAPI.onKDSFound((kds) => {
  //       console.log('+++++++++++++++++++++++++++')
  //       console.log(kds)
  //       console.log('+++++++++++++++++++++++++++')
  //       const kdsKey = `${kds.ip}:${kds.port}`;

  //       if (!connectedKDS.has(kdsKey)) {
  //         console.log(`✅ New KDS found: ${kdsKey}`);
  //         renderKDS(kds);
  //         connectedKDS.add(kdsKey);
  //       } else {
  //         console.log(`🔄 KDS ${kdsKey} is already connected.`);
  //       }
  //     });
  //   }

  //   // Initial scan
  //   scan();

  //   // Periodically scan for new KDS without disconnecting existing ones
  //   setInterval(scan, interval);
  // }


  // fetchKdsScreens(); // Auto-fetch when the page loads

  // // Handle connect/disconnect button click
  // kdsList.addEventListener('click', (event) => {
  //   if (event.target.classList.contains('connect-btn')) {
  //     const kdsDiv = event.target.parentElement;
  //     const ip = event.target.getAttribute('data-ip');
  //     const port = parseInt(event.target.getAttribute('data-port'), 10);
  //     let isConnected = event.target.textContent === 'Disconnect';
  //     let connectedKDSList = JSON.parse(localStorage.getItem('connectedKDSList')) || [];

  //     if (isConnected) {
  //       // Disconnecting from KDS
  //       console.log(`🔴 Disconnecting from KDS: ${ip}:${port}`);
  //       connectedKDSList = connectedKDSList.filter((kds) => !(kds.ip === ip && kds.port === port));
  //       localStorage.setItem('connectedKDSList', JSON.stringify(connectedKDSList));

  //       // Properly trigger a disconnection request to the POS
  //       window.electronAPI.disconnectKDS({ ip, port });

  //       // Update UI
  //       kdsDiv.querySelector('.connect-btn').textContent = 'Connect';
  //     } else {
  //       // Connecting to KDS
  //       console.log(`🔵 Trying to connect to KDS: ${ip}:${port}`);
  //       window.electronAPI.connectKDS({ ip, port });
  //     }
  //   }
  // });

  // // Handle successful connection
  // window.electronAPI.onKDSConnected((kds) => {
  //   console.log("🔥 Received kds-connected event in renderer:", kds);

  //   if (!kds || !kds.ip || !kds.port) return;
  //   // Retrieve existing connected KDS list from localStorage
  //   let connectedKDSList = JSON.parse(localStorage.getItem('connectedKDSList')) || [];

  //   // Check if the KDS is already in the list to avoid duplicates
  //   const exists = connectedKDSList.some(item => item.ip === kds.ip && item.port === kds.port);
  //   if (!exists) {
  //     connectedKDSList.push(kds);
  //   }

  //   // Save updated list back to localStorage
  //   localStorage.setItem('connectedKDSList', JSON.stringify(connectedKDSList));
  //   // Update UI for connected KDS
  //   const kdsDiv = document.querySelector(`[data-ip="${kds.ip}"][data-port="${kds.port}"]`);
  //   if (kdsDiv) {
  //     kdsDiv.querySelector('.connect-btn').textContent = 'Disconnect';
  //   }
  // });

  // // Handle KDS error
  // window.electronAPI.onKDSError((errorMessage) => {
  //   alert(`❌ KDS Error: ${errorMessage}`);
  // });

  // // Handle order status updates
  // window.electronAPI.onOrderStatus((status) => {
  //   alert(`📦 Order Update: ${status}`);
  // });
// });

// Store connected KDS to prevent duplicates
const connectedKDS = new Set();
localStorage.removeItem('connectedKDSList');

function showKdsSettings() {
  console.log("🔄 Showing Kitchen Display Settings...");

  const printerContainer = document.getElementById('printerContainer');
  const kdsContainer = document.getElementById("kdsContainer");
  const generalContainer = document.getElementById("generalContainer");
  kdsContainer.classList.remove('hidden');
  generalContainer.classList.add('hidden');
  printerContainer.classList.add('hidden');
  const kdsList = document.getElementById("kdsList");

  // // Store connected KDS to prevent duplicates
  // const connectedKDS = new Set();

  function renderKDS(kds) {
    const existingKDS = document.querySelector(`[data-ip="${kds.ip}"][data-port="${kds.port}"]`);
    if (existingKDS) return; // Avoid duplicates

    const kdsDiv = document.createElement("div");
    kdsDiv.setAttribute("data-ip", kds.ip);
    kdsDiv.setAttribute("data-port", kds.port);
    kdsDiv.setAttribute("data-name", kds.name);
    kdsDiv.setAttribute("data-department", kds.department);
    kdsDiv.innerHTML = `
      <div style="gap: 1rem; background-color: white; padding: 1rem; display: flex; flex-direction: column;
          box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; border-radius: 20px;">
          <h1 style="font-size: 18px; color: #2B2B2B; font-weight: 500;">${kds.name}</h1>
          <p style="font-size: 14px; color: #2B2B2B;">
              <span>Kitchen Department</span>:&nbsp;<span>${kds.department}</span>
          </p>
          <button data-ip="${kds.ip}" data-port="${kds.port}" data-name="${kds.name}" data-department="${kds.department}" class="connect-btn"
              style="align-self: flex-start; border-radius: 20px; font-size: 16px; color: white; border: none;
              padding: 0.6rem 1rem; background: linear-gradient(#EFA280, #DF6229);">
              Connect
          </button>
      </div>
    `;
    kdsList.appendChild(kdsDiv);
  }

  function fetchKdsScreens() {
    console.log("🔍 Scanning for KDS screens...");

    function scan() {
      window.electronAPI.scanKDS();
      window.electronAPI.onKDSFound((kds) => {
        const kdsKey = `${kds.ip}:${kds.port}`;
        if (!connectedKDS.has(kdsKey)) {
          console.log(`✅ New KDS found: ${kdsKey}`);
          renderKDS(kds);
          connectedKDS.add(kdsKey);
        }
      });
    }

    scan(); // Only scan once
  }

  fetchKdsScreens();

  // Ensure only ONE click event listener is added
  kdsList.removeEventListener("click", handleKDSClick);
  kdsList.addEventListener("click", handleKDSClick);

  function handleKDSClick(event) {
    if (event.target.classList.contains("connect-btn")) {
      const ip = event.target.getAttribute("data-ip");
      const name = event.target.getAttribute("data-name");
      const department = event.target.getAttribute("data-department");
      const port = parseInt(event.target.getAttribute("data-port"), 10);
      let isConnected = event.target.textContent === "Disconnect";
      let connectedKDSList = JSON.parse(localStorage.getItem("connectedKDSList")) || [];
      if (isConnected) {
        console.log(`🔴 Disconnecting from KDS: ${ip}:${port}`);
        connectedKDSList = connectedKDSList.filter((kds) => !(kds.ip === ip && kds.port === port));
        localStorage.setItem("connectedKDSList", JSON.stringify(connectedKDSList));
        window.electronAPI.disconnectKDS({ ip, port, name, department });
        event.target.textContent = "Connect";
      } else {
        console.log(`🔵 Trying to connect to KDS: ${ip}:${port}`);
        window.electronAPI.connectKDS({ ip, port, name, department });
      }
    }
  }

  // Listen for successful connection
  window.electronAPI.onKDSConnected((kds) => {
    if (!kds || !kds.ip || !kds.port) return;
    let connectedKDSList = JSON.parse(localStorage.getItem("connectedKDSList")) || [];

    if (!connectedKDSList.some(item => item.ip === kds.ip && item.port === kds.port)) {
      connectedKDSList.push(kds);
    }

    localStorage.setItem("connectedKDSList", JSON.stringify(connectedKDSList));

    const kdsDiv = document.querySelector(`[data-ip="${kds.ip}"][data-port="${kds.port}"]`);
    if (kdsDiv) {
      const button = kdsDiv.querySelector(".connect-btn");
      if (button) button.textContent = "Disconnect";
    }
  });

  // Handle errors
  window.electronAPI.onKDSError((errorMessage) => {
    alert(`❌ KDS Error: ${errorMessage}`);
  });

  // Handle order status updates
  window.electronAPI.onOrderStatus((status) => {
    alert(`📦 Order Update: ${status}`);
  });
}

window.electronAPI.onOrderUpdated((orderData) => {
  console.log('✅ Order Updated in Renderer:', orderData);
});

// Function to send order details to main.js
async function saveOrderDetails(orderDetails) {
  try {
    let connectedKDSList = JSON.parse(localStorage.getItem("connectedKDSList")) || [];
    console.log(connectedKDSList);
    if (connectedKDSList && Array.isArray(connectedKDSList) && connectedKDSList.length > 0) {
      if (connectedKDSList.length > 1) {
        alert('select kds first');
        return false;
      } else {
        const result = await window.api.invoke('save-order', orderDetails); // Use invoke
        console.log('Response from main:', result);
        if (result.success) {
          window.electronAPI.sendToKDS(connectedKDSList[0].ip, connectedKDSList[0].port, { orderId: result.orderId, orderDetails : orderDetails });
          window.electronAPI.onOrderUpdated((orderData) => {
            console.log('✅ Order Updated:', orderData);
        
            // Remove the order from the UI
            const orderElement = document.getElementById(`order-${orderData.order_id}`);
            if (orderElement) {
                orderElement.remove();
            }
        });
        
          return result.success;
        } else {
          alert('Something wents wrong!');
          return false;
        }
      }
    } else {
      alert('Please connect the kds first');
      return false;
    }
  } catch (error) {
    console.error("Error saving order:", error);
    return false;
  }
}


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


//=================================================================//



// // Listen for the confirmation message from the main process
// window.api.receive("dummy-order-come", (event, message) => {
//   console.log(message);
// });