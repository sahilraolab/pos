
function checkInternetConnection() {
  if (navigator.onLine) {
    console.log('Internet is connected');
    return true;
  } else {
    console.log('Internet is not connected');
    return false;
  }
}

function showMenuCategories(menuCategories) {
  let itemContainer = document.getElementById("selectedCategoryMenuList");
  let categoryContainer = document.getElementById("menuCategoryList");

  // Reset existing content to prevent duplicates
  if (itemContainer) {
    itemContainer.innerHTML = '';
  }
  if (categoryContainer) {
    categoryContainer.innerHTML = '';
  }

  if (!itemContainer || !categoryContainer) {
    console.error("Container elements not found");
    return;
  }

  // Function to display items of a specific category
  function displayItems(category) {
    itemContainer.innerHTML = '';
    const categoryItems = menuCategories.find(cat => cat.category === category).items;
    categoryItems.forEach((item) => {
      const itemObj = JSON.stringify(item);
      itemContainer.innerHTML += `
        <div class="category_menu_item" data-item='${itemObj}' onclick="selectProduct(this)">
          <div class="imgCon">
            <img src="${item.imageUrl}" alt="${item.name}">
          </div>  
          <span>${item.name}</span>
          <div><span class="price">$${item.price}</span><span>/portion</span></div>
        </div>
      `;
    });
  }


  // Display category buttons and attach click event listeners
  menuCategories.forEach((categoryObj) => {
    const categoryButton = document.createElement('button');
    categoryButton.classList.add("menu_category_button");
    categoryButton.innerText = categoryObj.category;
    categoryButton.addEventListener('click', (event) => {
      document.querySelectorAll('.menu_category_button').forEach(item => item.classList.remove("active"));
      event.target.classList.add('active');
      displayItems(categoryObj.category);
      // Update the heading for the chosen category
      const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
      categoryHeading.innerText = `${categoryObj.category} Menu`;
    });
    categoryContainer.appendChild(categoryButton);
  });

  // Display items of the first category by default
  if (menuCategories.length > 0) {
    displayItems(menuCategories[0].category);
    // Update the heading for the first category
    const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
    categoryHeading.innerText = `${menuCategories[0].category} Menu`;
    categoryContainer.firstChild.classList.add('active');
  }
}

function updateQuickLinks(show, hide1, hide2) {
  document.getElementById(show).classList.add('active');
  document.getElementById(hide1).classList.remove('active');
  document.getElementById(hide2).classList.remove('active');
}

function updateDots() {
  dots.forEach((dot, index) => {
    if (index < pin.length) {
      dot.textContent = pin[index];
      dot.classList.add('filled');
    } else {
      dot.textContent = '';
      dot.classList.remove('filled');
    }
  });
}

async function verifyPin(pin) {
  const token = localStorage.getItem('POSAuthenticationToken');
  if (!token) {
    alert('No token found. Please login again.');
    return;
  }

  const requestBody = {
    token: token,
    pin: pin
  };

  try {
    const response = await fetch('http://localhost:3000/pos-saleperson-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('PIN verification failed');
    }

    const data = await response.json();
    console.log('PIN verification successful:', data);

    showMainContent();
    const dayStart = localStorage.getItem('dayStart');
    if (!dayStart) {
      showStartDayModel();
    } else {
      showPunchInModel();
    }

  } catch (error) {
    console.error('Error during PIN verification:', error);
    alert('PIN verification failed. Please try again.');
    clearDots();
  } finally {
    hideLoader();
  }
}

function showMainContent() {
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.add("hidden");
  document.querySelector(".loginContainer").classList.add("hidden");
}

function showStartDayModel() {
  document.querySelector('.start_day').classList.remove("hidden");
}

function submitStartDayModel(event) {
  event.preventDefault();
  showLoader();
  document.querySelector('.start_day').classList.add("hidden");
  localStorage.setItem('dayStart', true);
  showPunchInModel();
  hideLoader();
}

function showPunchInModel() {
  document.querySelector('.punch_in').classList.remove('hidden');
}

function sumbitPunchInModle() {
  showLoader();
  document.querySelector('.punch_in').classList.add('hidden');
  document.querySelector('.order_type').classList.remove('hidden');
  document.querySelector('.content').classList.remove('hidden');
  updateQuickLinks("quickBill", "dineIn", "Pickup");
  loadMenu();
  hideLoader();
}

function loadMenu() {
  showLoader(true);
  const menu = [
    {
      category: "Pizza",
      items: [
        {
          id: 1,
          name: "Margherita",
          price: 8.99,
          description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1625937759429-cb12c50970b4?q=80&w=2887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Olives", price: 1.0 },
            { name: "Mushrooms", price: 1.0 }
          ]
        },
        {
          id: 2,
          name: "Pepperoni",
          price: 9.99,
          description: "Pizza with tomato sauce, mozzarella, and pepperoni slices.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: null
        },
        // More items...
      ]
    },
    {
      category: "Salad",
      items: [
        {
          id: 4,
          name: "Caesar Salad",
          price: 7.99,
          description: "Romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.",
          available: true,
          group: ["total", "healthy"],
          imageUrl: "https://images.unsplash.com/photo-1625937759420-26d7e003e04c?q=80&w=3021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Grilled Chicken", price: 2.5 },
            { name: "Bacon Bits", price: 1.5 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        {
          id: 5,
          name: "Greek Salad",
          price: 8.49,
          description: "Mixed greens, tomatoes, cucumbers, red onions, olives, feta cheese, and Greek dressing.",
          available: true,
          group: ["total", "healthy"],
          imageUrl: "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Grilled Chicken", price: 2.5 },
            { name: "Bacon Bits", price: 1.5 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        // More items...
      ]
    },
    {
      category: "Sandwich",
      items: [
        {
          id: 7,
          name: "Turkey Club",
          price: 9.49,
          description: "Turkey, bacon, lettuce, tomato, and mayo on toasted bread.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1655195672072-0ffaa663dfa4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Bacon", price: 2.0 },
            { name: "Cheese", price: 1.0 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        {
          id: 8,
          name: "BLT",
          price: 7.99,
          description: "Bacon, lettuce, and tomato with mayo on toasted bread.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1625937759420-26d7e003e04c?q=80&w=3021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Bacon", price: 2.0 },
            { name: "Cheese", price: 1.0 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        // More items...
      ]
    },
    {
      category: "Burger",
      items: [
        {
          id: 10,
          name: "Classic Cheeseburger",
          price: 10.99,
          description: "Beef patty with cheddar cheese, lettuce, tomato, onions, and pickles on a sesame seed bun.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1625937759429-cb12c50970b4?q=80&w=2887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Bacon", price: 2.0 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        {
          id: 11,
          name: "Bacon Burger",
          price: 12.49,
          description: "Beef patty with bacon, cheddar cheese, lettuce, tomato, and BBQ sauce on a sesame seed bun.",
          available: true,
          group: ["total", "fine"],
          imageUrl: "https://images.unsplash.com/photo-1655195672072-0ffaa663dfa4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Bacon", price: 2.0 },
            { name: "Avocado", price: 1.5 }
          ]
        },
        // More items...
      ]
    }
  ];

  showMenuCategories(menu);
  hideLoader();
}


function clearDots() {
  pin = '';
  updateDots();
}

function showLoader() {
  // Show overlay and loader
  document.querySelector('.loader-container').classList.remove('hidden');

  // Disable interactions with form elements
  const formElements = document.querySelectorAll('input, button,select, textarea');
  formElements.forEach(element => {
    element.disabled = true;
  });

  // Optionally disable scrolling
  document.body.style.overflow = 'hidden';
}

function hideLoader() {
  // Hide overlay and loader
  document.querySelector('.loader-container').classList.add('hidden');

  // Enable interactions with form elements
  const formElements = document.querySelectorAll('input, button,select, textarea');
  formElements.forEach(element => {
    element.disabled = false;
  });

  // Optionally enable scrolling
  document.body.style.overflow = 'auto';
}

async function handlePOSAuthentication(event) {
  event.preventDefault(); // Prevent the form from submitting
  showLoader();

  const posId = document.getElementById('posIdInput')?.value?.trim();
  const password = document.getElementById('passwordInput')?.value?.trim();

  // Validate inputs
  if (!posId || !password) {
    alert('Please enter POS ID and Password');
    hideLoader();
    return;
  }

  const requestBody = {
    clientId: posId,
    password: password
  };

  try {
    // Send POST request to server
    const response = await fetch('http://localhost:3000/pos-authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Handle response
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Authentication failed: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Authentication successful:', data);
    localStorage.setItem("POSAuthenticationToken", data.token);
    document.querySelector(".container").classList.remove("hidden");
    document.querySelector(".posloginContainer").classList.add("hidden");
    document.querySelector(".loginContainer").classList.remove("hidden");

  } catch (error) {
    console.error('Error during authentication:', error.message);
    alert(`Error: ${error.message}`);
  } finally {
    hideLoader();
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

function showPosInitialLoginScreen() {
  localStorage.clear();
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.remove("hidden");
}

function showSalePersonAuthScreen() {
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.add("hidden");
  document.querySelector(".loginContainer").classList.remove("hidden");
}

let lastOrderId = 0;

function generateSequentialOrderId() {
  // Increment the last ID, and wrap around if necessary
  lastOrderId = (lastOrderId + 1) % 10000;
  
  // Return as a zero-padded string
  return lastOrderId.toString().padStart(4, '0');
}


function selectProduct(element) {
  let dataObj = element.getAttribute('data-item');
  dataObj = JSON.parse(dataObj);
  const addons = dataObj.addons;
  let quantity = 1;
  document.querySelector('.right_aside').classList.remove('hidden');
  const menuItemsContainer = document.querySelector('.selected_menu');

  const menuItemHTML = `
    <div class="menu_item" data-selected-product="${dataObj.name}" data-quantity="${quantity}">
      <div class="menu_item_name">
        <span class="menu_item_product_name">${dataObj.name}</span>
        <span class="menu_item_product_price">$${(dataObj.price * quantity).toFixed(2)}</span>
      </div>
      <div class="menu_item_number__price">
        <span class="menu_item_sub_product_names"></span>
        <div>
          <button class="sub">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25012 8.99997H15.7501" stroke="#2B2B2B" stroke-width="1.125" stroke-linecap="round" />
            </svg>
          </button>
          <input type="text" class="menu_numbers" value="${quantity}">
          <button class="add">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.00012 2.24997V15.75" stroke="white" stroke-width="1.125" stroke-linecap="round" />
              <path d="M2.25012 8.99997H15.7501" stroke="white" stroke-width="1.125" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const menuItemElement = document.createElement('div');
  menuItemElement.innerHTML = menuItemHTML;
  menuItemsContainer.appendChild(menuItemElement);

  const subButton = menuItemElement.querySelector('.sub');
  const addButton = menuItemElement.querySelector('.add');
  const menuNumbersInput = menuItemElement.querySelector('.menu_numbers');
  const menuPriceElement = menuItemElement.querySelector('.menu_item_product_price');

  function updateItemCount(newCount) {
    let count = parseInt(newCount);
    if (isNaN(count) || count < 1) {
      menuItemsContainer.removeChild(menuItemElement);
      removeRightAside();
    } else {
      menuNumbersInput.value = count;
      const addonPrices = menuItemElement.querySelector('.menu_item_sub_product_names').textContent.split(', ').map(name => {
        const addon = addons.find(a => a.name === name);
        return addon ? addon.price : 0;
      });
      const totalAddonPrice = addonPrices.reduce((acc, price) => acc + price, 0);
      menuPriceElement.textContent = `$${(dataObj.price * count + totalAddonPrice).toFixed(2)}`;

      menuItemElement.setAttribute('data-quantity', count);
      updateOrderSummary();
    }
  }

  function removeRightAside() {
    const menuItems = document.querySelectorAll('.selected_menu .menu_item');
    if (menuItems.length === 0) {
      document.querySelector('.right_aside').classList.add('hidden');
    }
    updateOrderSummary();
  }

  menuNumbersInput.addEventListener('click', function () {
    this.select();
  });

  subButton.addEventListener('click', () => {
    updateItemCount(menuNumbersInput.value - 1);
  });

  addButton.addEventListener('click', () => {
    updateItemCount(menuNumbersInput.value - 1 + 2);
  });

  menuNumbersInput.addEventListener('input', () => {
    updateItemCount(menuNumbersInput.value);
  });

  if (addons && addons.length > 0) {
    const addonModelListSection = document.getElementById("addonItems");
    addonModelListSection.innerHTML = "";
    addons.forEach(addon => {
      addonModelListSection.innerHTML += `
        <button class="addon" data-name="${addon.name}">
            <span class="name">${addon.name}</span>
            <span class="price">($${addon.price})</span>
        </button>
      `;
    });

    document.querySelector('.add_on').classList.remove('hidden');

    const addonButtons = addonModelListSection.querySelectorAll('button');
    addonButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.classList.toggle('active');
      });
    });

    document.querySelector('.add_on_bottom .save').addEventListener('click', () => {
      const selectedAddons = [];
      addonButtons.forEach(button => {
        if (button.classList.contains('active')) {
          const name = button.querySelector('.name').textContent;
          const price = parseFloat(button.querySelector('.price').textContent.replace(/[()$]/g, ''));
          selectedAddons.push({ name, price });
        }
      });

      // Update the menu item HTML with the selected add-ons
      const addonNames = selectedAddons.map(addon => addon.name).join(', ');
      const addonPrices = selectedAddons.map(addon => addon.price);
      const totalAddonPrice = addonPrices.reduce((acc, price) => acc + price, 0);

      menuItemElement.querySelector('.menu_item_sub_product_names').textContent = addonNames;
      menuPriceElement.textContent = `$${(dataObj.price * quantity + totalAddonPrice).toFixed(2)}`;

      menuItemElement.setAttribute('data-selected-addons', JSON.stringify(selectedAddons));
      menuItemElement.setAttribute('data-quantity', quantity);

      document.querySelector('.add_on').classList.add('hidden');
      updateOrderSummary();
    });

    document.querySelector('.add_on_bottom .cancel').addEventListener('click', () => {
      document.querySelector('.add_on').classList.add('hidden');
    });
  }

  updateOrderSummary();
}

function showDiscounts() {
  const discounts = [
    { name: 'Broccoli Staff', type: 'subtotal', value: '50', unit: '%', code: "1234", selected: false, categories: [], groups: [] },
    { name: 'Summer Sale', type: 'subtotal', value: '20', unit: '%', code: "1235", selected: false, categories: [], groups: [] },
    { name: 'Holiday Discount', type: 'category', value: '5', unit: '$', code: "1236", selected: false, categories: ['vegetables'], groups: [] },
    { name: 'Loyalty Discount', type: 'subtotal', value: '10', unit: '%', code: "1237", selected: false, categories: [], groups: [] },
    { name: 'Group Discount', type: 'group', value: '15', unit: '%', code: "1238", selected: false, categories: ['fruits'], groups: ['citrus'] },
  ];

  const discountModal = document.getElementById('discountModal');
  const discountList = document.getElementById('discountList');

  const discountApplied = JSON.parse(localStorage.getItem("selectedDiscount"));

  if (discountApplied) {
    discounts.forEach(discount => {
      if (discount.name === discountApplied.name) {
        discount.selected = true;
      }
    });
  }

  discountList.innerHTML = ''; // Clear previous discounts

  discounts.forEach((discount, index) => {
    const discountElement = document.createElement('div');
    discountElement.innerHTML = `
      <div class="discount_left ${discount.selected ? 'selected_section' : ''}">
        <div class="selected">
          <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
          </svg>
        </div>
        <div class="value">
          <span>${discount.name}</span>
          <span>(on ${discount.type})</span>
        </div>
      </div>
      <div class="discount_badge">
        <span class="discount_text">${discount.value}${discount.unit}</span>
        <svg width="8" height="72" viewBox="0 0 8 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 0C4 2.2766 5.52153 4.19783 7.60317 4.80228C7.83154 4.86859 8 5.07088 8 5.30868V9.09122C8 9.32902 7.83154 9.53132 7.60317 9.59763C5.52153 10.2021 4 12.1233 4 14.3999C4 16.6765 5.52153 18.5977 7.60317 19.2022C7.83154 19.2685 8 19.4708 8 19.7086V23.4911C8 23.7289 7.83154 23.9312 7.60317 23.9975C5.52153 24.602 4 26.5232 4 28.7998C4 31.0764 5.52153 32.9976 7.60317 33.6021C7.83154 33.6684 8 33.8707 8 34.1085V37.8915C8 38.1293 7.83154 38.3316 7.60317 38.3979C5.52153 39.0024 4 40.9236 4 43.2002C4 45.4768 5.52153 47.398 7.60317 48.0025C7.83154 48.0688 8 48.2711 8 48.5089V52.2914C8 52.5292 7.83154 52.7315 7.60317 52.7978C5.52153 53.4023 4 55.3235 4 57.6001C4 59.8767 5.52153 61.7979 7.60317 62.4024C7.83154 62.4687 8 62.671 8 62.9088V66.6913C8 66.9291 7.83154 67.1314 7.60317 67.1977C5.52153 67.8022 4 69.7234 4 72H0V0H4Z"
            fill="url(#paint0_linear_7196_752)" />
          <defs>
            <linearGradient id="paint0_linear_7196_752" x1="4" y1="0" x2="4" y2="72" gradientUnits="userSpaceOnUse">
              <stop stop-color="#EFA280" />
              <stop offset="1" stop-color="#DF6229" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    `;

    discountElement.addEventListener('click', (event) => {
      discounts.forEach((d, i) => {
        if (i !== index) {
          d.selected = false;
          const otherElement = discountList.children[i].querySelector('.discount_left');
          if (otherElement) {
            otherElement.classList.remove('selected_section');
          }
        }
      });

      discount.selected = !discount.selected;
      event.currentTarget.querySelector('.discount_left').classList.toggle('selected_section', discount.selected);
    });

    discountList.appendChild(discountElement);
  });

  discountModal.classList.remove('hidden');

  document.querySelector('.discount_bottom .apply').addEventListener('click', () => {
    const selectedDiscount = discounts.find(discount => discount.selected);
    console.log('Selected discount:', selectedDiscount);
    discountModal.classList.add('hidden');
    // Apply the selected discount to the order (update order summary, localStorage, etc.)
    localStorage.setItem("selectedDiscount", JSON.stringify(selectedDiscount));
    updateOrderSummary(selectedDiscount);
  });

  document.querySelector('.discount_bottom .cancel').addEventListener('click', () => {
    discounts.forEach(discount => discount.selected = false);
    discountModal.classList.add('hidden');
  });
}

function showAdditionalChargesModel() {
  const charges = [
    { name: 'Broccoli Staff', type: 'total', value: '50', unit: '%', selected: false, groups: ["total"] },
    { name: 'Summer Sale', type: 'total', value: '20', unit: '%', selected: false, groups: ["total"] },
    { name: 'Fly Dubai', type: 'item', value: '5', unit: '$', selected: false, groups: ["fine"] },
    { name: 'Better homes', type: 'total', value: '10', unit: '%', selected: false, groups: ["total"] },
  ];

  const chargesModel = document.getElementById('chargeModel');
  const chargesList = document.getElementById('chargeList');

  chargesList.innerHTML = ''; // Clear previous charges

  charges.forEach((data, index) => {
    const chargeElement = document.createElement('div');
    chargeElement.innerHTML = `
      <div class="additional_charges_left ${data.selected ? 'selected_section' : ''}">
        <div class="selected">
          <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
          </svg>
        </div>
        <div class="value">
          <span>${data.name}</span>
          <span>(on ${data.type})</span>
        </div>
      </div>
      <div class="additional_charges_badge">
        <span class="discount_text">${data.value}${data.unit}</span>
      </div>
    `;

    chargeElement.addEventListener('click', (event) => {
      charges.forEach((d, i) => {
        if (i !== index) {
          d.selected = false;
          const otherElement = chargesList.children[i].querySelector('.additional_charges_left');
          if (otherElement) {
            otherElement.classList.remove('selected_section');
          }
        }
      });

      data.selected = !data.selected;
      event.currentTarget.querySelector('.additional_charges_left').classList.toggle('selected_section', data.selected);
    });

    chargesList.appendChild(chargeElement);
  });

  chargesModel.classList.remove('hidden');

  document.querySelector('.additional_charges_bottom .apply').addEventListener('click', () => {
    const selectedCharge = charges.find(data => data.selected);
    console.log('Selected charge:', selectedCharge);
    chargesModel.classList.add('hidden');
    document.body.setAttribute('data-charge', JSON.stringify(selectedCharge));
    updateOrderSummary(null, selectedCharge);
  });

  document.querySelector('.additional_charges_bottom .cancel').addEventListener('click', () => {
    charges.forEach(data => data.selected = false);
    chargesModel.classList.add('hidden');
  });
}

function showCouponModel() {
  const coupons = [
    { name: 'Broccoli Staff', type: 'total', value: '50', unit: '%', code: "1234", selected: false, groups: ["total"] },
    { name: 'Summer Sale', type: 'total', value: '20', unit: '%', code: "1235", selected: false, groups: ["total"] },
    { name: 'Holiday Discount', type: 'item', value: '5', unit: '$', code: "1236", selected: false, groups: ["fine"] },
    { name: 'Loyalty Discount', type: 'total', value: '10', unit: '%', code: "1237", selected: false, groups: ["total"] },
  ];

  let couponModel = document.getElementById("couponCodeModel");
  couponModel.classList.remove('hidden');

  document.querySelector('.apply_coupon_bottom .apply').addEventListener('click', () => {
    const inputElement = document.getElementById("couponCode");
    if (inputElement) {
      const selectedCoupon = coupons.find(data => data.code === inputElement.value.trim());
      if (selectedCoupon) {
        console.log('Selected Coupon:', selectedCoupon);
        couponModel.classList.add('hidden');
        document.body.setAttribute('data-discount', JSON.stringify(selectedCoupon));
        updateOrderSummary(selectedCoupon);
      } else {
        alert("Invalid Code");
      }
    } else {
      alert("Enter a code");
    }
  });

  document.querySelector('.apply_coupon_bottom .cancel').addEventListener('click', () => {
    const inputElement = document.getElementById("couponCode");
    inputElement.value = "";
    couponModel.classList.add('hidden');
  });
}


function updateOrderSummary(selectedDiscount = null, selectedCharge = null) {
  const orderItems = Array.from(document.querySelectorAll('.selected_menu .menu_item')).map(item => {
    const name = item.getAttribute('data-selected-product');
    const price = parseFloat(item.querySelector('.menu_item_product_price').textContent.replace('$', ''));
    const quantity = parseInt(item.getAttribute('data-quantity'));
    const addons = item.getAttribute('data-selected-addons') ? JSON.parse(item.getAttribute('data-selected-addons')) : [];

    return { name, price, quantity, addons };
  });

  let subtotal = orderItems.reduce((acc, item) => acc + item.price, 0);
  let discountAmount = 0;
  let chargeAmount = 0;

  if (selectedDiscount) {
    if (selectedDiscount.type === 'subtotal') {
      if (selectedDiscount.unit === '%') {
        discountAmount = subtotal * (parseFloat(selectedDiscount.value) / 100);
      } else if (selectedDiscount.unit === '$') {
        discountAmount = parseFloat(selectedDiscount.value);
      }
    } else if (selectedDiscount.type === 'category') {
      orderItems.forEach(item => {
        if (selectedDiscount.categories.includes(item.category)) {
          if (selectedDiscount.unit === '%') {
            discountAmount += item.price * item.quantity * (parseFloat(selectedDiscount.value) / 100);
          } else if (selectedDiscount.unit === '$') {
            discountAmount += parseFloat(selectedDiscount.value);
          }
        }
      });
    } else if (selectedDiscount.type === 'group') {
      orderItems.forEach(item => {
        if (selectedDiscount.categories.includes(item.category) && selectedDiscount.groups.includes(item.group)) {
          if (selectedDiscount.unit === '%') {
            discountAmount += item.price * item.quantity * (parseFloat(selectedDiscount.value) / 100);
          } else if (selectedDiscount.unit === '$') {
            discountAmount += parseFloat(selectedDiscount.value);
          }
        }
      });
    }
  }

  if (selectedCharge) {
    if (selectedCharge.type === 'subtotal') {
      if (selectedCharge.unit === '%') {
        chargeAmount = subtotal * (parseFloat(selectedCharge.value) / 100);
      } else if (selectedCharge.unit === '$') {
        chargeAmount = parseFloat(selectedCharge.value);
      }
    } else if (selectedCharge.type === 'category') {
      orderItems.forEach(item => {
        if (selectedCharge.categories.includes(item.category)) {
          if (selectedCharge.unit === '%') {
            chargeAmount += item.price * item.quantity * (parseFloat(selectedCharge.value) / 100);
          } else if (selectedCharge.unit === '$') {
            chargeAmount += parseFloat(selectedCharge.value);
          }
        }
      });
    } else if (selectedCharge.type === 'group') {
      orderItems.forEach(item => {
        if (selectedCharge.categories.includes(item.category) && selectedCharge.groups.includes(item.group)) {
          if (selectedCharge.unit === '%') {
            chargeAmount += item.price * item.quantity * (parseFloat(selectedCharge.value) / 100);
          } else if (selectedCharge.unit === '$') {
            chargeAmount += parseFloat(selectedCharge.value);
          }
        }
      });
    }
  }

  const total = subtotal - discountAmount + chargeAmount;

  // Update DOM elements to display the order summary
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `$${discountAmount.toFixed(2)}`;
  document.getElementById('charges').textContent = `$${chargeAmount.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}



//=================================================================//

const dots = document.querySelectorAll('.dot');
const keys = document.querySelectorAll('.key');
let pin = '';

keys.forEach(key => {
  key.addEventListener('click', () => {
    if (key.classList.contains('delete')) {
      pin = pin.slice(0, -1);
    } else if (pin.length < 4) {
      pin += key.textContent.trim();
    }
    updateDots();

    if (pin.length === 4) {
      verifyPin(pin);
    }
  });
});



// Listen for the confirmation message from the main process
window.api.receive("dummy-order-come", (event, message) => {
  console.log(message);
});