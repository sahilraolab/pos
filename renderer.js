
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
      const addonsString = JSON.stringify(item.addons);
      itemContainer.innerHTML += `
        <div class="category_menu_item" data-addons='${addonsString}' onclick="selectProduct('${item.name}', ${item.price}, 1, this)">
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

// Function to update the localStorage with the selected products and their add-ons
function updateLocalStorage() {
  const menuItems = document.querySelectorAll('.selected_menu .menu_item');
  const products = [];

  menuItems.forEach(menuItem => {
    const name = menuItem.querySelector('.menu_item_product_name').textContent;
    const basePrice = parseFloat(menuItem.querySelector('.menu_item_product_price').textContent.replace('$', '')) / parseInt(menuItem.querySelector('.menu_numbers').value);
    const quantity = parseInt(menuItem.querySelector('.menu_numbers').value);
    const addonNames = menuItem.querySelector('.menu_item_sub_product_names').textContent.split(', ').filter(name => name !== "");

    const addons = addonNames.map(name => {
      const addon = Array.from(document.querySelectorAll(`.addon`)).find(el => el.querySelector('.name').textContent === name);
      return {
        name: addon.querySelector('.name').textContent,
        price: parseFloat(addon.querySelector('.price').textContent.replace(/[()$]/g, ''))
      };
    });

    products.push({ name, basePrice, quantity, addons });
  });

  localStorage.setItem('selectedProducts', JSON.stringify(products));
}

// Function to update the order summary based on the data in localStorage
function updateOrderSummary() {
  const products = JSON.parse(localStorage.getItem('selectedProducts')) || [];
  let subtotal = 0;
  let totalAddonPrice = 0;

  products.forEach(product => {
    subtotal += product.basePrice * product.quantity;
    product.addons.forEach(addon => {
      totalAddonPrice += addon.price * product.quantity;
    });
  });

  const discount = 0; // Example discount value, replace with your calculation logic
  const taxRate = 0.13; // Example tax rate, replace with your tax calculation logic

  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax + totalAddonPrice;

  document.querySelector('.menu_bills:nth-child(2) span:nth-child(2)').textContent = `$${subtotal.toFixed(2)}`;
  document.querySelector('.menu_bills:nth-child(3) span:nth-child(2)').textContent = `$${discount.toFixed(2)}`;
  document.querySelector('.menu_bills:nth-child(4) span:nth-child(2)').textContent = `$${tax.toFixed(2)}`;
  document.querySelector('.menu_total span:nth-child(2)').textContent = `$${total.toFixed(2)}`;
}

// Modified selectProduct function to include localStorage updates
function selectProduct(name, price, quantity, element) {
  const addonsString = element.getAttribute('data-addons');
  const addons = JSON.parse(addonsString);
  console.log('Selected product:', { name, price, quantity, addons });
  document.querySelector('.right_aside').classList.remove('hidden');
  const menuItemsContainer = document.querySelector('.selected_menu');

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
      menuPriceElement.textContent = `$${(price * quantity + totalAddonPrice).toFixed(2)}`;

      document.querySelector('.add_on').classList.add('hidden');

      // Update localStorage and order summary after adding addons
      updateLocalStorage();
      updateOrderSummary();
    });

    document.querySelector('.add_on_bottom .cancel').addEventListener('click', () => {
      document.querySelector('.add_on').classList.add('hidden');
      addonModelListSection.innerHTML = ""; // Clear add-ons list
    });
  }

  const menuItemHTML = `
    <div class="menu_item">
      <div class="menu_item_name">
        <span class="menu_item_product_name">${name}</span>
        <span class="menu_item_product_price">$${(price * quantity).toFixed(2)}</span>
      </div>
      <div class="menu_item_number__price">
        <span class="menu_item_sub_product_names">${addons ? addons.map(a => a.name).join(', ') : ""}</span>
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
      menuPriceElement.textContent = `$${(price * count + totalAddonPrice).toFixed(2)}`;

      // Update localStorage and order summary after changing quantity
      updateLocalStorage();
      updateOrderSummary();
    }
  }

  function removeRightAside() {
    const menuItems = document.querySelectorAll('.selected_menu .menu_item');
    if (menuItems.length === 0) {
      document.querySelector('.right_aside').classList.add('hidden');
    }

    // Update localStorage and order summary after removing an item
    updateLocalStorage();
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

  // Update localStorage and order summary after adding a new product
  updateLocalStorage();
  updateOrderSummary();
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

  // Duplicate items removed and addon data added.


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

//=================================================================//


const menuItems = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 8.99,
    description: "Classic margherita pizza with fresh tomatoes, mozzarella cheese, and basil.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?pizza"
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    category: "Pizza",
    price: 9.99,
    description: "Pepperoni pizza with mozzarella cheese and tomato sauce.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?pepperoni,pizza"
  },
  {
    id: 3,
    name: "BBQ Chicken Pizza",
    category: "Pizza",
    price: 11.99,
    description: "BBQ chicken pizza with mozzarella cheese, red onions, and cilantro.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?bbq,chicken,pizza"
  },
  {
    id: 4,
    name: "Caesar Salad",
    category: "Salad",
    price: 6.99,
    description: "Fresh romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?caesar,salad"
  },
  {
    id: 5,
    name: "Greek Salad",
    category: "Salad",
    price: 7.99,
    description: "Greek salad with cucumbers, tomatoes, olives, feta cheese, and Greek dressing.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?greek,salad"
  },
  {
    id: 6,
    name: "Grilled Chicken Sandwich",
    category: "Sandwich",
    price: 8.49,
    description: "Grilled chicken sandwich with lettuce, tomato, and mayo on a toasted bun.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?grilled,chicken,sandwich"
  },
  {
    id: 7,
    name: "Club Sandwich",
    category: "Sandwich",
    price: 9.49,
    description: "Club sandwich with turkey, bacon, lettuce, tomato, and mayo on toasted bread.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?club,sandwich"
  },
  {
    id: 8,
    name: "Cheeseburger",
    category: "Burger",
    price: 10.99,
    description: "Juicy cheeseburger with lettuce, tomato, pickles, and special sauce on a sesame seed bun.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?cheeseburger"
  },
  {
    id: 9,
    name: "Veggie Burger",
    category: "Burger",
    price: 9.99,
    description: "Delicious veggie burger with lettuce, tomato, pickles, and special sauce on a whole wheat bun.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?veggie,burger"
  },
  {
    id: 10,
    name: "Spaghetti Bolognese",
    category: "Pasta",
    price: 12.99,
    description: "Classic spaghetti Bolognese with homemade meat sauce and Parmesan cheese.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?spaghetti,bolognese"
  },
  {
    id: 11,
    name: "Fettuccine Alfredo",
    category: "Pasta",
    price: 13.99,
    description: "Creamy fettuccine Alfredo with Parmesan cheese and parsley.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?fettuccine,alfredo"
  },
  {
    id: 12,
    name: "Chocolate Cake",
    category: "Dessert",
    price: 5.99,
    description: "Rich and moist chocolate cake with chocolate frosting.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?chocolate,cake"
  },
  {
    id: 13,
    name: "Cheesecake",
    category: "Dessert",
    price: 6.99,
    description: "Creamy cheesecake with a graham cracker crust and strawberry topping.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?cheesecake"
  },
  {
    id: 14,
    name: "French Fries",
    category: "Side",
    price: 2.99,
    description: "Crispy golden French fries.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?french,fries"
  },
  {
    id: 15,
    name: "Onion Rings",
    category: "Side",
    price: 3.99,
    description: "Crispy fried onion rings.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?onion,rings"
  },
  {
    id: 16,
    name: "Chicken Wings",
    category: "Appetizer",
    price: 7.99,
    description: "Spicy chicken wings with a side of ranch dressing.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?chicken,wings"
  },
  {
    id: 17,
    name: "Garlic Bread",
    category: "Side",
    price: 3.99,
    description: "Garlic bread topped with melted butter and herbs.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?garlic,bread"
  },
  {
    id: 18,
    name: "Fish Tacos",
    category: "Main Course",
    price: 12.99,
    description: "Crispy fish tacos with cabbage slaw and lime crema.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?fish,tacos"
  },
  {
    id: 19,
    name: "Lemonade",
    category: "Beverage",
    price: 2.99,
    description: "Refreshing lemonade made with fresh lemons.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?lemonade"
  },
  {
    id: 20,
    name: "Iced Tea",
    category: "Beverage",
    price: 2.49,
    description: "Cool and refreshing iced tea.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?iced,tea"
  },
  {
    id: 21,
    name: "Mocha Latte",
    category: "Beverage",
    price: 4.99,
    description: "Rich mocha latte with whipped cream.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?mocha,latte"
  },
  {
    id: 22,
    name: "Pancakes",
    category: "Breakfast",
    price: 5.99,
    description: "Fluffy pancakes served with maple syrup.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?pancakes"
  },
  {
    id: 23,
    name: "Omelette",
    category: "Breakfast",
    price: 6.99,
    description: "Three-egg omelette with your choice of fillings.",
    available: true,
    imageUrl: "https://source.unsplash.com/random/?omelette"
  }
];

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