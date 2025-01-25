document.addEventListener("DOMContentLoaded", () => {

    const quickOrderDetails = {
        orderId: "",
        userInfo: null,
        discount: "",
        coupon: "",
        additionCharges: "",
        orderSummary: "",
        selectedMenuList: [],
        status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
        orderDate: new Date().toISOString(),
        orderTime: new Date().toLocaleTimeString(),
    }
    const pickUpOrderDetails = {
        orderId: "",
        userInfo: null,
        discount: "",
        coupon: "",
        additionCharges: "",
        orderSummary: "",
        selectedMenuList: [],
        status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
        orderDate: new Date().toISOString(),
        orderTime: new Date().toLocaleTimeString(),
    }

    const dineInOrderDetails = {
        orderId: "",
        userInfo: null,
        discount: "",
        coupon: "",
        additionCharges: "",
        orderSummary: "",
        selectedMenuList: [],
        tableDetails: {
            floor: "",
            table: "",
        },
        status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
        orderDate: new Date().toISOString(),
        orderTime: new Date().toLocaleTimeString(),
    }

    localStorage.setItem("quickOrderDetails", JSON.stringify(quickOrderDetails));
    localStorage.setItem("pickUpOrderDetails", JSON.stringify(pickUpOrderDetails));
    localStorage.setItem("dineInOrderDetails", JSON.stringify(dineInOrderDetails));


    showDashboardScreen();

    // Right aside rezide functionality start
    const rightAside = document.getElementById("rightAside");
    const rightAsideHandle = document.getElementById("rightAsideHandle");

    let isResizing = false;

    rightAsideHandle.addEventListener("mousedown", function (e) {
        isResizing = true;
        document.addEventListener("mousemove", resize, false);
        document.addEventListener("mouseup", stopResize, false);
    });

    function resize(e) {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            rightAside.style.width = newWidth + "px";
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener("mousemove", resize, false);
        document.removeEventListener("mouseup", stopResize, false);
    }

    // Right aside rezide functionality end

    // Create a MutationObserver
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                // Check if the 'hidden' class is removed
                if (!rightAside.classList.contains("hidden")) {
                    onRightAsideVisible();
                }
            }
        }
    });

    // Observe changes to the 'class' attribute of the element
    observer.observe(rightAside, { attributes: true });

});

function onRightAsideVisible() {
    console.log("right is now visible!");
    showLoader();
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });

    if (orderDetails.userInfo && orderDetails.orderId) {
        const customerInfo = document.querySelector('.customer_info');
        customerInfo.innerHTML = `
            <p>${orderDetails.userInfo.fullName}</p>
            <p>Order ID #<span>${orderDetails.orderId}</span></p>
        `;

        customerInfo.classList.remove('hidden');
    } else {
        document.querySelector('.menu_bills_btn').innerHTML = `
        <button onclick="deleteItems()">Item</button>
        <button onclick="handlePlaceOrder()">Place Order</button>
        `;
    }

    const menuItemsContainer = document.querySelector(".menu_item_list");
    menuItemsContainer.innerHTML = ""; // Clear existing items

    orderDetails.selectedMenuList.forEach((dataObj) => {
        const menuItemHTML = `
            <div class="menu_item">
              <div class="menu_item_name">
                <span class="menu_item_product_name">${dataObj.name}</span>
                <span class="menu_item_product_price">$${dataObj.totalPrice.toFixed(2)}</span>
              </div>
              <div class="menu_item_number__price">
                <span class="menu_item_sub_product_names">${dataObj.selectedAddons?.map(addon => addon.name).join(', ') || ''}</span>
                <div>
                  <button class="sub">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.25012 8.99997H15.7501" stroke="#2B2B2B" stroke-width="1.125" stroke-linecap="round" />
                    </svg>
                  </button>
                  <input type="text" class="menu_numbers" value="${dataObj.quantity}">
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

        const menuItemElement = document.createElement("div");
        menuItemElement.classList.add('selected_menu_item');
        menuItemElement.innerHTML = menuItemHTML;
        menuItemsContainer.appendChild(menuItemElement);

        const subButton = menuItemElement.querySelector(".sub");
        const addButton = menuItemElement.querySelector(".add");
        const menuNumbersInput = menuItemElement.querySelector(".menu_numbers");
        const menuPriceElement = menuItemElement.querySelector(".menu_item_product_price");

        function updateItemCount(newCount) {
            let count = parseInt(newCount);
            if (isNaN(count) || count < 1) {
                menuItemsContainer.removeChild(menuItemElement);
                orderDetails.selectedMenuList = orderDetails.selectedMenuList.filter(item => item.name !== dataObj.name);
                updateOrderStorage(orderDetails);
            } else {
                // Update quantity in the data object
                dataObj.quantity = count;

                // Update the input field value
                menuNumbersInput.value = count;

                // Calculate the total addon price
                const totalAddonPrice = dataObj.selectedAddons?.reduce((acc, addon) => acc + addon.price, 0) || 0;

                // Update the total price in the data object
                dataObj.totalPrice = (dataObj.price + totalAddonPrice) * count;

                // Update the price display
                menuPriceElement.textContent = `$${dataObj.totalPrice.toFixed(2)}`;
                updateOrderStorage(orderDetails); // Save changes to localStorage
            }
        }

        subButton.addEventListener("click", () => {
            updateItemCount(menuNumbersInput.value - 1);
        });

        addButton.addEventListener("click", () => {
            updateItemCount(menuNumbersInput.value - 1 + 2);
        });

        menuNumbersInput.addEventListener("input", () => {
            updateItemCount(menuNumbersInput.value);
        });
    });



    hideLoader();

}

function deleteItems() {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
    orderDetails.selectedMenuList = []; // Clear the selected items list
    updateOrderStorage(orderDetails);  // Save the changes
}

function handlePlaceOrder() {
    document.querySelector('.selected_menu').classList.add('hidden');
    document.querySelector('.customer_details').classList.remove('hidden');

    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    if (openedOrderTypeLink === "quickBill") {
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="" onclick="handleQuickBillPayment()">Payment</button>
        `;
        document.querySelector('.menu_bills_btn').style.justifyContent = "center";
    } else {
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="" onclick="saveKot()">Save KOT</button>
            <button style="" onclick="saveAndPrintKot()">Save & Print KOT</button>
        `;
    }
}

function handleBackToMenuList(){
    showLoader();
    document.querySelector('.selected_menu').classList.remove('hidden');
    document.querySelector('.customer_details').classList.add('hidden');
    document.querySelector('.menu_bills_btn').innerHTML = `
    <button onclick="deleteItems()">Item</button>
    <button onclick="handlePlaceOrder()">Place Order</button>
    `;
    document.querySelector('.menu_bills_btn').style.justifyContent = "normal";
    hideLoader();
}

function showDashboardScreen() {
    showLoader();
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    switch (openedOrderTypeLink) {
        case "dineIn":
            showDineIn();
            break;
        case "pickUp":
            showPickupScreen();
            break;
        case "quickBill":
            showQuickBillScreen();
            break;

        default:
            showQuickBillScreen();
            break;
    }
    loadMenu();
}

function showOngoingOrdersScreen() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    // Show the new section and active the clicked link
    document.getElementById("ongoingOrderLink").classList.add("active");
    document.getElementById("ongoingOrdersSection").classList.remove("hidden");
    localStorage.setItem("openedNavigationLink", "ongoingOrderLink");
    localStorage.setItem("openedNavigationSection", "ongoingOrdersSection");
    hideLoader();
}

function showBillsScreen() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    // Show the new section and active the clicked link
    document.getElementById("billsSectionLink").classList.add("active");
    document.getElementById("billsSection").classList.remove("hidden");
    localStorage.setItem("openedNavigationLink", "billsSectionLink");
    localStorage.setItem("openedNavigationSection", "billsSection");
    hideLoader();
}

function showSettingScreen() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    // Show the new section and active the clicked link
    document.getElementById("settingSectionLink").classList.add("active");
    document.getElementById("settingSection").classList.remove("hidden");
    localStorage.setItem("openedNavigationLink", "settingSectionLink");
    localStorage.setItem("openedNavigationSection", "settingSection");
    hideLoader();
}

function showQuickBillScreen() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link & quick bill link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    if (openedOrderTypeLink) {
        document.getElementById(openedOrderTypeLink).classList.remove("active");
    }
    // Open the dashboard section, active the dashboard link and quick bill link
    document.getElementById("quickBill").classList.add("active");
    document.getElementById("dashboardLink").classList.add("active");
    document.getElementById("dashboardSection").classList.remove("hidden");
    localStorage.setItem("openedOrderTypeLink", "quickBill");
    localStorage.setItem("openedNavigationLink", "dashboardLink");
    localStorage.setItem("openedNavigationSection", "dashboardSection");
    const quickOrderDetails = JSON.parse(localStorage.getItem('quickOrderDetails'));
    if (quickOrderDetails && quickOrderDetails.selectedMenuList && quickOrderDetails.selectedMenuList.length > 0) {
        // Data to show on right sidebar
        // document.querySelector(".right_aside").classList.remove("hidden");
        // document.querySelector(".selected_menu").classList.remove("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
        renderSelectedMenu();
        updateOrderSummary();
    } else {
        // document.querySelector(".right_aside").classList.add("hidden");
        // document.querySelector(".selected_menu").classList.add("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    }
    hideLoader();
}

function showPickupScreen() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link & quick bill link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    if (openedOrderTypeLink) {
        if (openedOrderTypeLink != "pickUp") {
            document.querySelectorAll('.selected_menu_item').forEach((element) => {
                element.remove(); // Removes the element from the DOM
            });
        }
        document.getElementById(openedOrderTypeLink).classList.remove("active");
    }
    // Open the dashboard section, active the dashboard link and quick bill link
    document.getElementById("pickUp").classList.add("active");
    document.getElementById("dashboardLink").classList.add("active");
    document.getElementById("dashboardSection").classList.remove("hidden");
    localStorage.setItem("openedOrderTypeLink", "pickUp");
    localStorage.setItem("openedNavigationLink", "dashboardLink");
    localStorage.setItem("openedNavigationSection", "dashboardSection");
    const pickUpOrderDetails = JSON.parse(localStorage.getItem('pickUpOrderDetails'));
    if (pickUpOrderDetails && pickUpOrderDetails.selectedMenuList && pickUpOrderDetails.selectedMenuList.length > 0) {
        // Data to show on right sidebar
        // document.querySelector(".right_aside").classList.remove("hidden");
        // document.querySelector(".selected_menu").classList.remove("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
        renderSelectedMenu();
        updateOrderSummary();
    } else {
        // document.querySelector(".right_aside").classList.add("hidden");
        // document.querySelector(".selected_menu").classList.add("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    }
    hideLoader();
}

function showDineIn() {
    showLoader();
    // Hide the currently opened section and inactive the currentely opened section link & quick bill link
    const openedNavigationLink = localStorage.getItem("openedNavigationLink");
    const openedNavigationSection = localStorage.getItem(
        "openedNavigationSection"
    );
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    if (openedNavigationLink && openedNavigationSection) {
        document.getElementById(openedNavigationLink).classList.remove("active");
        document.getElementById(openedNavigationSection).classList.add("hidden");
    }
    if (openedOrderTypeLink) {
        document.getElementById(openedOrderTypeLink).classList.remove("active");
    }
    // Open the dashboard section, active the dashboard link and quick bill link
    document.getElementById("dineIn").classList.add("active");
    document.getElementById("dashboardLink").classList.add("active");
    document.getElementById("dashboardSection").classList.remove("hidden");
    localStorage.setItem("openedOrderTypeLink", "dineIn");
    localStorage.setItem("openedNavigationLink", "dashboardLink");
    localStorage.setItem("openedNavigationSection", "dashboardSection");
    const dineInOrderDetails = JSON.parse(localStorage.getItem('dineInOrderDetails'));
    if (dineInOrderDetails && dineInOrderDetails.selectedMenuList && dineInOrderDetails.selectedMenuList.length > 0) {
        // Data to show on right sidebar
        // document.querySelector(".right_aside").classList.remove("hidden");
        // document.querySelector(".selected_menu").classList.remove("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
        renderSelectedMenu();
        updateOrderSummary();
    } else {
        // document.querySelector(".right_aside").classList.add("hidden");
        // document.querySelector(".selected_menu").classList.add("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    }
    hideLoader();
}

async function loadMenu() {
    showLoader(true);
    try {
        const menuItems = await fetchMenuItems(); // Replace with your API fetch logic
        const categories = await fetchCategories(); // Replace with your API fetch logic

        showMenuCategories(menuItems, categories);
    } catch (error) {
        console.error("Error loading menu:", error);
    } finally {
        hideLoader();
    }
}

function showMenuCategories(menuItems, categories) {
    const itemContainer = document.getElementById("selectedCategoryMenuList");
    const categoryContainer = document.getElementById("menuCategoryList");

    if (!itemContainer || !categoryContainer) {
        console.error("Container elements not found");
        return;
    }

    // Reset existing content
    itemContainer.innerHTML = "";
    categoryContainer.innerHTML = "";

    // Display category buttons
    categories.forEach((categoryObj) => {
        const categoryButton = document.createElement("button");
        categoryButton.classList.add("menu_category_button");
        categoryButton.innerText = categoryObj.name;
        categoryButton.addEventListener("click", (event) => {
            document
                .querySelectorAll(".menu_category_button")
                .forEach((button) => button.classList.remove("active"));
            event.target.classList.add("active");
            displayItems(categoryObj.id);

            // Update category heading
            const categoryHeading = document.querySelector(
                ".choosen_category_menu_items h3"
            );
            categoryHeading.innerText = `${categoryObj.name} Menu`;
        });
        categoryContainer.appendChild(categoryButton);
    });

    // Display items for the first category by default
    if (categories.length > 0) {
        const firstCategory = categories[0];
        displayItems(firstCategory.id);

        const categoryHeading = document.querySelector(
            ".choosen_category_menu_items h3"
        );
        categoryHeading.innerText = `${firstCategory.name} Menu`;

        categoryContainer.firstChild.classList.add("active");
    }

    // Function to display items of a specific category
    function displayItems(categoryId) {
        itemContainer.innerHTML = "";
        const categoryItems = menuItems.filter((item) =>
            item.categories.includes(categoryId)
        );

        if (categoryItems.length === 0) {
            itemContainer.innerHTML = "<p>No items available in this category.</p>";
            return;
        }

        categoryItems.forEach((item) => {
            const itemObj = JSON.stringify(item);
            const itemElement = `
          <div class="category_menu_item" data-item='${itemObj}' onclick="selectProduct(this)">
            <div class="imgCon">
              <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <span>${item.name}</span>
            <div>
              <span class="price">$${item.price.toFixed(2)}</span>
              <span>/portion</span>
            </div>
          </div>
        `;
            itemContainer.innerHTML += itemElement;
        });
    }
}

function getValidAddons(addons, item) {
    return addons.filter((addon) => {
        // Check if addon is enabled
        if (addon.status !== "enable") return false;

        // Check if at least one category matches
        const hasCategoryMatch = addon.categories.some((category) =>
            item.categories.includes(category)
        );
        if (!hasCategoryMatch) return false;

        // Check if addon applies to all items or is explicitly included
        return addon.allItems || item.addons.includes(addon.id);
    });
}

// Updates the order details in local storage
function updateOrderStorage(orderDetails) {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    if (openedOrderTypeLink === "quickBill") {
        localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
    } else if (openedOrderTypeLink === "pickUp") {
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
    } else {
        localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
    }
    if(orderDetails.selectedMenuList && orderDetails.selectedMenuList.length > 0){
        document.querySelector(".right_aside").classList.remove("hidden");
        updateOrderSummary();
    } else {
        document.querySelector(".right_aside").classList.add("hidden");
    }
}

// Fetches the selected menu from localStorage and renders it in the UI
// function renderSelectedMenu() {
//     const orderDetails = JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] };
//     const menuItemsContainer = document.querySelector(".selected_menu");
//     menuItemsContainer.innerHTML = ""; // Clear existing items

//     orderDetails.selectedMenuList.forEach((dataObj) => {
//         const menuItemHTML = `
//             <div class="menu_item">
//               <div class="menu_item_name">
//                 <span class="menu_item_product_name">${dataObj.name}</span>
//                 <span class="menu_item_product_price">$${dataObj.totalPrice.toFixed(2)}</span>
//               </div>
//               <div class="menu_item_number__price">
//                 <span class="menu_item_sub_product_names">${dataObj.selectedAddons?.map(addon => addon.name).join(', ') || ''}</span>
//                 <div>
//                   <button class="sub">
//                     <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M2.25012 8.99997H15.7501" stroke="#2B2B2B" stroke-width="1.125" stroke-linecap="round" />
//                     </svg>
//                   </button>
//                   <input type="text" class="menu_numbers" value="${dataObj.quantity}">
//                   <button class="add">
//                     <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                       <path d="M9.00012 2.24997V15.75" stroke="white" stroke-width="1.125" stroke-linecap="round" />
//                       <path d="M2.25012 8.99997H15.7501" stroke="white" stroke-width="1.125" stroke-linecap="round" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//         `;

//         const menuItemElement = document.createElement("div");
//         menuItemElement.classList.add('selected_menu_item');
//         menuItemElement.innerHTML = menuItemHTML;
//         menuItemsContainer.appendChild(menuItemElement);

//         const subButton = menuItemElement.querySelector(".sub");
//         const addButton = menuItemElement.querySelector(".add");
//         const menuNumbersInput = menuItemElement.querySelector(".menu_numbers");
//         const menuPriceElement = menuItemElement.querySelector(".menu_item_product_price");

//         function updateItemCount(newCount) {
//             let count = parseInt(newCount);
//             if (isNaN(count) || count < 1) {
//                 menuItemsContainer.removeChild(menuItemElement);
//                 orderDetails.selectedMenuList = orderDetails.selectedMenuList.filter(item => item.name !== dataObj.name);
//                 if (document.querySelectorAll('.selected_menu_item')?.length === 0) {
//                     deleteItems();
//                 } else {
//                     updateOrderSummary();
//                 }
//             } else {
//                 // Update quantity in the data object
//                 dataObj.quantity = count;

//                 // Update the input field value
//                 menuNumbersInput.value = count;

//                 // Calculate the total addon price
//                 const totalAddonPrice = dataObj.selectedAddons?.reduce((acc, addon) => acc + addon.price, 0) || 0;

//                 // Update the total price in the data object
//                 dataObj.totalPrice = (dataObj.price + totalAddonPrice) * count;

//                 // Update the price display
//                 menuPriceElement.textContent = `$${dataObj.totalPrice.toFixed(2)}`;
//                 updateOrderStorage(orderDetails); // Save changes to localStorage
//             }
//         }

//         subButton.addEventListener("click", () => {
//             updateItemCount(menuNumbersInput.value - 1);
//         });

//         addButton.addEventListener("click", () => {
//             updateItemCount(menuNumbersInput.value - 1 + 2);
//         });

//         menuNumbersInput.addEventListener("input", () => {
//             updateItemCount(menuNumbersInput.value);
//         });
//     });
// }

// Global function to handle "save" button clicks
function handleSave(event) {
    event.preventDefault();

    const selectedAddons = [];
    const addonButtons = document.querySelectorAll("#addonItems button");
    addonButtons.forEach((button) => {
        if (button.classList.contains("active")) {
            const name = button.querySelector(".name").textContent;
            const price = parseFloat(button.querySelector(".price").textContent.replace(/[()$]/g, ""));
            selectedAddons.push({ name, price });
        }
    });

    const totalAddonPrice = selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
    const dataObj = JSON.parse(localStorage.getItem("currentDataObj")) || {}; // Use a temporary storage for dataObj
    dataObj.totalPrice = dataObj.price * dataObj.quantity + totalAddonPrice;
    dataObj.selectedAddons = selectedAddons.length > 0 ? selectedAddons : null;

    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem("quickOrderDetails")) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem("pickUpOrderDetails")) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem("dineInOrderDetails")) || { selectedMenuList: [] };

    document.querySelector(".add_on").classList.add("hidden");
    orderDetails.selectedMenuList.push(dataObj);
    updateOrderStorage(orderDetails); // Save changes to localStorage
}

// Handles the selection of a product
async function selectProduct(element) {
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem("quickOrderDetails")) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem("pickUpOrderDetails")) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem("dineInOrderDetails")) || { selectedMenuList: [] };

    let dataObj = element.getAttribute("data-item");
    dataObj = JSON.parse(dataObj);
    dataObj.quantity = 1;
    dataObj.totalPrice = dataObj.price;

    // Save dataObj temporarily for reuse in handleSave
    localStorage.setItem("currentDataObj", JSON.stringify(dataObj));

    if (dataObj.addons && dataObj.addons.length > 0) {
        const addons = await fetchAddons(); // Replace with your API fetch logic
        dataObj.addons = getValidAddons(addons, dataObj);

        const addonModelListSection = document.getElementById("addonItems");
        addonModelListSection.innerHTML = "";
        dataObj.addons.forEach((addon) => {
            addonModelListSection.innerHTML += `
                <button class="addon">
                    <span class="name">${addon.name}</span>
                    <span class="price">($${addon.price})</span>
                </button>
            `;
        });

        document.querySelector(".add_on").classList.remove("hidden");

        const addonButtons = addonModelListSection.querySelectorAll("button");
        addonButtons.forEach((button) => {
            button.addEventListener("click", () => {
                button.classList.toggle("active");
            });
        });

        // Remove existing listener and add the new one
        const saveButton = document.querySelector(".add_on_bottom .save");
        saveButton.removeEventListener("click", handleSave);
        saveButton.addEventListener("click", handleSave);

        document.querySelector(".add_on_bottom .cancel").addEventListener("click", () => {
            document.querySelector(".add_on").classList.add("hidden");
            // if(orderDetails.selectedMenuList && orderDetails.selectedMenuList.length == 0){
            //     deleteItems();
            // }
        });
    } else {
        orderDetails.selectedMenuList.push(dataObj);
        updateOrderStorage(orderDetails);
    }
}


function showDiscounts() {
    const discounts = [
        {
            name: "Pizza Discount - Dine In",
            order_type: ["dinein"],
            fixed: false,
            value: "20", // 20% discount
            code: "PIZZA20",
            selected: false,
            categories: ["Pizza"], // Applies to the Pizza category
            items: ["Margherita Pizza", "Pepperoni Pizza"], // Specific items
            day: ["Sunday", "Monday"], // Applicable days
            startTime: "11:00 AM",
            endTime: "03:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "Caesar Salad Special - Pickup",
            order_type: ["pickup, dinein"],
            fixed: true,
            value: "10", // $10 off
            code: "SALAD10",
            selected: false,
            categories: ["Salads"], // Applies to the Salad category
            items: ["Caesar Salad"], // Specific item
            day: ["Wednesday"], // Only on Wednesdays
            startTime: "10:00 AM",
            endTime: "02:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-15", // Offer end date
        },
        {
            name: "Quick Bill Drinks Offer",
            order_type: ["quickbill"],
            fixed: false,
            value: "15", // 15% discount
            code: "DRINKS15",
            selected: false,
            categories: ["Drinks"], // Applies to Drinks category
            items: ["Coke", "Pepsi", "Lemonade"], // Specific items
            day: ["Friday", "Saturday"], // Weekend offer
            startTime: "05:00 PM",
            endTime: "10:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "All Day Breakfast - All Orders",
            order_type: ["all"],
            fixed: true,
            value: "5", // $5 off
            code: "BREAKFAST5",
            selected: false,
            categories: ["all"], // Applies to Breakfast category
            items: ["Pancakes", "Omelette", "French Toast"], // Specific items
            day: ["Sunday"], // Only on Sundays
            startTime: "07:00 AM",
            endTime: "12:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
    ];

    const discountModal = document.getElementById("discountModal");
    const discountList = document.getElementById("discountList");
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetailsTypeName = openedOrderTypeLink === "quickBill" ? 'quickOrderDetails' : openedOrderTypeLink === "pickUp" ? "pickUpOrderDetails" : 'dineInOrderDetails';
    const orderDetails = JSON.parse(localStorage.getItem(orderDetailsTypeName));

    if (orderDetails.discount) {
        discounts.forEach((discount) => {
            if (discount.name === orderDetails.discount.name) {
                discount.selected = true;
            }
        });
    }

    discountList.innerHTML = ""; // Clear previous discounts

    discounts.forEach((discount, index) => {
        const discountElement = document.createElement("div");

        discountElement.innerHTML = `
        <div class="discount_left ${discount.selected ? "selected_section" : ""
            }">
          <div class="selected">
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </div>
          <div class="value">
            <span>${discount.name}</span>
            <span>(on ${discount.order_type.join(", ")})</span>
          </div>
        </div>
        <div class="discount_badge">
            <span class="discount_text">${discount.value}${discount.fixed ? "$" : "%"}</span>
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

        discountElement.addEventListener("click", (event) => {
            discounts.forEach((d, i) => {
                if (i !== index) {
                    d.selected = false;
                    const otherElement = discountList.children[i].querySelector(".discount_left");
                    if (otherElement) {
                        otherElement.classList.remove("selected_section");
                    }
                }
            });

            discount.selected = !discount.selected;
            event.currentTarget.querySelector(".discount_left").classList.toggle("selected_section", discount.selected);
        });

        discountList.appendChild(discountElement);
    });

    discountModal.classList.remove("hidden");

    document.querySelector(".discount_bottom .apply").addEventListener("click", (event) => {
        event.preventDefault();
        const selectedDiscount = discounts.find((discount) => discount.selected);

        if (!selectedDiscount) {
            // No discount selected, remove the existing discount
            // localStorage.removeItem("selectedDiscount");
            orderDetails.discount = "";
            localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Discount removed.");
        } else {
            // Apply the selected discount
            // localStorage.setItem("selectedDiscount", JSON.stringify(selectedDiscount));
            orderDetails.discount = selectedDiscount;
            localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Selected discount:", selectedDiscount);
        }

        discountModal.classList.add("hidden");
        updateOrderSummary(); // Your function to handle selected discount
    });

    document.querySelector(".discount_bottom .cancel").addEventListener("click", () => {
        discountModal.classList.add("hidden");
    });
}

function showAdditionalChargesModel() {
    const charges = [
        {
            name: "Pizza Charge - Dine In",
            order_type: ["dinein"],
            fixed: false,
            value: "20", // 20% charge
            code: "PIZZA20",
            selected: false,
            categories: ["Pizza"], // Applies to the Pizza category
            items: ["Margherita Pizza", "Pepperoni Pizza"], // Specific items
            day: ["Sunday", "Monday"], // Applicable days
            startTime: "11:00 AM",
            endTime: "03:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "Caesar Salad Special - Pickup",
            order_type: ["pickup", "dinein"],
            fixed: true,
            value: "10", // $10 charge
            code: "SALAD10",
            selected: false,
            categories: ["Salads"], // Applies to the Salad category
            items: ["Caesar Salad"], // Specific item
            day: ["Wednesday"], // Only on Wednesdays
            startTime: "10:00 AM",
            endTime: "02:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-15", // Offer end date
        },
        {
            name: "Quick Bill Drinks Charge",
            order_type: ["quickbill"],
            fixed: false,
            value: "15", // 15% charge
            code: "DRINKS15",
            selected: false,
            categories: ["Drinks"], // Applies to Drinks category
            items: ["Coke", "Pepsi", "Lemonade"], // Specific items
            day: ["Friday", "Saturday"], // Weekend offer
            startTime: "05:00 PM",
            endTime: "10:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "All Day Breakfast - All Orders",
            order_type: ["all"],
            fixed: true,
            value: "5", // $5 charge
            code: "BREAKFAST5",
            selected: false,
            categories: ["all"], // Applies to Breakfast category
            items: ["Pancakes", "Omelette", "French Toast"], // Specific items
            day: ["Sunday"], // Only on Sundays
            startTime: "07:00 AM",
            endTime: "12:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
    ];

    const chargesModel = document.getElementById("chargesModel");
    const chargesList = document.getElementById("chargeList");
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetailsTypeName = openedOrderTypeLink === "quickBill" ? 'quickOrderDetails' : openedOrderTypeLink === "pickUp" ? "pickUpOrderDetails" : 'dineInOrderDetails';
    const orderDetails = JSON.parse(localStorage.getItem(orderDetailsTypeName));

    // Preselect saved charge
    if (orderDetails.additionCharges) {
        charges.forEach((charge) => {
            if (charge.name === orderDetails.additionCharges.name) {
                charge.selected = true;
            }
        });
    }

    // Clear previous charges
    chargesList.innerHTML = "";

    // Populate charges list
    charges.forEach((data, index) => {
        const chargeElement = document.createElement("div");
        chargeElement.innerHTML = `
        <div class="additional_charges_left ${data.selected ? "selected_section" : ""}">
          <div class="selected">
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </div>
          <div class="value">
            <span>${data.name}</span>
            <span>(on ${data.order_type.join(", ")})</span>
          </div>
        </div>
        <div class="additional_charges_badge">
            <span class="charge_text">${data.value}${data.fixed ? "$" : "%"}</span>
        </div>
        `;

        // Add click event to toggle selection
        chargeElement.addEventListener("click", (event) => {
            charges.forEach((d, i) => {
                if (i !== index) d.selected = false;
            });

            data.selected = !data.selected;

            // Re-render all to reflect selection state
            charges.forEach((d, i) => {
                const element = chargesList.children[i]?.querySelector(".additional_charges_left");
                if (element) {
                    element.classList.toggle("selected_section", d.selected);
                }
            });
        });

        chargesList.appendChild(chargeElement);
    });

    // Show charges model
    chargesModel.classList.remove("hidden");

    // Apply button functionality
    document.querySelector(".additional_charges_bottom .apply").addEventListener("click", (event) => {
        event.preventDefault();
        const selectedCharge = charges.find((data) => data.selected);

        if (!selectedCharge) {
            // localStorage.removeItem("selectedCharges");
            orderDetails.additionCharges = "";
            localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("No charge selected. Previous charges cleared.");
        } else {
            // localStorage.setItem("selectedCharges", JSON.stringify(selectedCharge));
            orderDetails.additionCharges = selectedCharge;
            localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Selected charge:", selectedCharge);
        }

        chargesModel.classList.add("hidden");
        updateOrderSummary();
    });

    // Cancel button functionality
    document.querySelector(".additional_charges_bottom .cancel").addEventListener("click", () => {
        chargesModel.classList.add("hidden");
    });
}

function showCouponModel() {
    const coupons = [
        {
            name: "Pizza Discount - Dine In",
            order_type: ["dinein"],
            fixed: false,
            value: "20", // 20% discount
            code: "PIZZA20",
            selected: false,
            categories: ["Pizza"], // Applies to the Pizza category
            items: ["Margherita Pizza", "Pepperoni Pizza"], // Specific items
            day: ["Sunday", "Monday"], // Applicable days
            startTime: "11:00 AM",
            endTime: "03:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "Caesar Salad Special - Pickup",
            order_type: ["pickup, dinein"],
            fixed: true,
            value: "10", // $10 off
            code: "SALAD10",
            selected: false,
            categories: ["Salads"], // Applies to the Salad category
            items: ["Caesar Salad"], // Specific item
            day: ["Wednesday"], // Only on Wednesdays
            startTime: "10:00 AM",
            endTime: "02:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-15", // Offer end date
        },
        {
            name: "Quick Bill Drinks Offer",
            order_type: ["quickbill"],
            fixed: false,
            value: "15", // 15% discount
            code: "DRINKS15",
            selected: false,
            categories: ["Drinks"], // Applies to Drinks category
            items: ["Coke", "Pepsi", "Lemonade"], // Specific items
            day: ["Friday", "Saturday"], // Weekend offer
            startTime: "05:00 PM",
            endTime: "10:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
        {
            name: "All Day Breakfast - All Orders",
            order_type: ["all"],
            fixed: true,
            value: "5", // $5 off
            code: "BREAKFAST5",
            selected: false,
            categories: ["all"], // Applies to Breakfast category
            items: ["Pancakes", "Omelette", "French Toast"], // Specific items
            day: ["Sunday"], // Only on Sundays
            startTime: "07:00 AM",
            endTime: "12:00 PM",
            startDate: "2024-12-01", // Offer start date
            endDate: "2024-12-31", // Offer end date
        },
    ];

    let couponModel = document.getElementById("couponCodeModel");
    const inputElement = document.getElementById("couponCode");
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetailsTypeName = openedOrderTypeLink === "quickBill" ? 'quickOrderDetails' : openedOrderTypeLink === "pickUp" ? "pickUpOrderDetails" : 'dineInOrderDetails';
    const orderDetails = JSON.parse(localStorage.getItem(orderDetailsTypeName));

    couponModel.classList.remove("hidden");
    if (orderDetails.coupon) {
        inputElement.value = orderDetails.coupon.code;
    }
    document
        .querySelector(".apply_coupon_bottom .apply")
        .addEventListener("click", (event) => {
            event.preventDefault();
            const inputElement = document.getElementById("couponCode");
            if (inputElement) {
                const selectedCoupon = inputElement.value.trim() === "TEST5";
                if (selectedCoupon) {
                    console.log("Applied Coupon:", coupons[3]);
                    couponModel.classList.add("hidden");
                    // Apply the selected coupon to the order (update order summary, localStorage, etc.)
                    // localStorage.setItem(
                    //     "addedCoupon",
                    //     JSON.stringify(coupons[3])
                    // );
                    orderDetails.coupon = coupons[3];
                    localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
                    updateOrderSummary();
                } else {
                    alert("Invalid Code, Codes are case sensitive");
                }
            } else {
                alert("Enter a code");
            }
        });

    document
        .querySelector(".apply_coupon_bottom .cancel")
        .addEventListener("click", () => {
            inputElement.value = "";
            couponModel.classList.add("hidden");
            // localStorage.removeItem("addedCoupon");
            orderDetails.coupon = "";
            localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            updateOrderSummary();
        });
}

function updateOrderSummary() {
    // Placeholder for product data, replace with your actual data source
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });

    const orderSummary = {
        subtotal: 0,
        tax: 0,
        discount: 0, // Optional discount value
        additionalCharges: 0, // Optional additional charges value
        coupon: 0, // Optional coupon value
        total: 0
    };

    orderDetails.selectedMenuList.forEach((item) => {
        const itemPrice = item.price * item.quantity;
        const addonPrices = item.selectedAddons
            ? item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
            : 0;
        orderSummary.subtotal += itemPrice + addonPrices;
    });

    // Apply tax
    const TAX_RATE = 0.1; // 10% tax, modify as needed
    orderSummary.tax = orderSummary.subtotal * TAX_RATE;

    // Retrieve discount from localStorage
    // const discountData = JSON.parse(localStorage.getItem("selectedDiscount")); // Assuming discount is stored as JSON
    const discountData = orderDetails.discount;
    if (discountData) {
        if (discountData.fixed) {
            orderSummary.discount = parseFloat(discountData.value); // Fixed discount
        } else {
            // Percentage discount
            const percentageDiscount = (discountData.value / 100) * orderSummary.subtotal;
            orderSummary.discount = percentageDiscount;
        }
    }

    // Retrieve charges from localStorage
    // const chargesData = JSON.parse(localStorage.getItem("selectedCharges")); // Assuming discount is stored as JSON
    const chargesData = orderDetails.additionCharges;
    if (chargesData) {
        if (chargesData.fixed) {
            orderSummary.additionalCharges = parseFloat(chargesData.value); // Fixed discount
        } else {
            // Percentage discount
            const percentageCharge = (chargesData.value / 100) * orderSummary.subtotal;
            orderSummary.additionalCharges = percentageCharge;
        }
    }

    // Retrieve coupon from localStorage
    // const couponData = JSON.parse(localStorage.getItem("addedCoupon")); // Assuming coupon is stored as JSON
    const couponData = orderDetails.coupon;
    if (couponData) {
        if (couponData.fixed) {
            orderSummary.coupon = parseFloat(couponData.value); // Fixed coupon discount
        } else {
            // Percentage coupon discount
            const percentageDiscount = (couponData.value / 100) * orderSummary.subtotal;
            orderSummary.coupon = percentageDiscount;
        }
    }

    // Calculate total
    orderSummary.total =
        orderSummary.subtotal +
        orderSummary.tax +
        orderSummary.additionalCharges -
        (orderSummary.discount + orderSummary.coupon);


    // Update the order summary section in the UI
    const summaryContainer = document.querySelector(".order_summary");
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="summary_row">
                <span>Subtotal:</span>
                <span>$${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary_row">
                <span>Tax (10%):</span>
                <span>$${orderSummary.tax.toFixed(2)}</span>
            </div>
            <div class="summary_row">
                <span>Discount:</span>
                <span>-$${orderSummary.discount.toFixed(2)}</span>
            </div>
            ${orderSummary.coupon > 0 ?
                `<div class="summary_row">
                    <span>${orderDetails.coupon.name}:</span>
                    <span>-$${orderSummary.coupon.toFixed(2)}</span>
                </div>` : ''
            }
            <div class="summary_row">
                <span>Additional Charges:</span>
                <span>+$${orderSummary.additionalCharges.toFixed(2)}</span>
            </div>
            <div class="dotted_line"></div>
            <div class="summary_row summary_total">
                <span>Total:</span>
                <span>$${orderSummary.total < 0 ? 0.00 : orderSummary.total.toFixed(2)}</span>
            </div>
        `;
    }

    // localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    orderDetails.orderSummary = orderSummary;
    localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails));
}

// function deleteItems(all) {
//     showLoader();
//     const orderDetails = JSON.parse(localStorage.getItem('quickOrderDetails'));
//     if (all) {
//         const _orderDetails = {
//             orderId: "",
//             userInfo: "",
//             discount: "",
//             coupon: "",
//             additionCharges: "",
//             orderSummary: "",
//             selectedMenuList: [],
//             status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
//             orderDate: new Date().toISOString(),
//             orderTime: new Date().toLocaleTimeString(),
//         }
//         localStorage.setItem('quickOrderDetails', JSON.stringify(_orderDetails));
//     } else {
//         orderDetails.selectedMenuList = [];
//         localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails));
//     }
//     document.querySelectorAll('.selected_menu_item').forEach((element) => {
//         element.remove(); // Removes the element from the DOM
//     });
//     document.querySelector(".selected_menu").classList.remove("hidden");
//     document.querySelector(".customer_details").classList.add("hidden");
//     // document.querySelector(".right_aside").classList.add("hidden");
//     updateOrderSummary();
//     hideLoader();
// }

function placeQuickBillOrder() {
    showLoader();
    document.querySelector('.selected_menu').classList.add('hidden');
    document.querySelector('.customer_details').classList.remove('hidden');
    document.querySelector('.menu_bills_btn').innerHTML =
        `
        <button style="" onclick="handleQuickBillPayment()">Payment</button>
    `;
    document.querySelector('.menu_bills_btn').style.justifyContent = "center";
    hideLoader();
}

function handleCustomerDetailsForm() {
    // const form = document.querySelector(".customer_details_form");
    const orderDetails = JSON.parse(localStorage.getItem('quickOrderDetails'));
    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const kotNoteInput = document.getElementById("kotNote");


    const errors = [];
    const formData = {
        fullName: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        kotNote: kotNoteInput.value.trim(),
    };


    orderDetails.userInfo = formData;
    let orderId = generateUniqueOrderID();
    orderDetails.orderId = orderId;

    localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails));

    // Validate the full name field
    if (!formData.fullName) {
        errors.push("Full Name is mandatory.");
        return false
    }

    // Validate phone number (optional but should be numeric if provided)
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
        errors.push("Phone number should contain only numbers.");
        return false
    }

    // Display errors or log form data
    if (errors.length > 0) {
        console.error("Validation errors:", errors);
        alert("Form submission failed:\n" + errors.join("\n"));
        return false
    } else {
        console.log("Form submitted successfully:", formData);
        return true;
        // Perform further actions like sending data to the server if needed
    }
}


function handleQuickBillPayment() {
    showLoader();
    const success = handleCustomerDetailsForm();
    if (success) {
        document.getElementById('paymentModel').classList.remove('hidden');
        document.getElementById('totalBillAmtSpan').innerText = JSON.parse(localStorage.getItem('orderSummary'))?.total;
    }
    hideLoader();
}


function choosePaymentMethod(type) {
    if (type === "CASH") {
        document.getElementById('cashPaymentType').classList.add('active');
        document.getElementById('cardPaymentType').classList.remove('active');
    } else {
        document.getElementById('cardPaymentType').classList.add('active');
        document.getElementById('cashPaymentType').classList.remove('active');
    }
}

function calculateReturnAmount(event) {
    // Get the entered amount from the event
    const paidAmountInput = event.target;
    const returnAmountBox = document.getElementById('returnAmtBox');

    // Example bill amount (this can be dynamically updated as needed)
    const billAmount = JSON.parse(localStorage.getItem('orderSummary'))?.total;

    // Calculate and display the return amount
    const paidAmount = parseFloat(paidAmountInput.value);

    if (!isNaN(paidAmount)) {
        const returnAmount = paidAmount - billAmount;

        // Update the return amount box
        if (returnAmount >= 0) {
            returnAmountBox.textContent = `$${returnAmount.toFixed(2)}`;
            returnAmountBox.style.color = "#000000"; // Set active text color
        } else {
            returnAmountBox.textContent = "Insufficient Payment";
            returnAmountBox.style.color = "red"; // Set error text color
        }
    } else {
        returnAmountBox.textContent = "Return Amount";
        returnAmountBox.style.color = "#C2C2C2"; // Reset color
    }

    // Function to copy return amount when the box is clicked
    returnAmountBox.addEventListener('click', () => {
        const textToCopy = returnAmountBox.textContent;

        if (textToCopy && textToCopy !== "Return Amount" && textToCopy !== "Insufficient Payment") {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert(`Copied: ${textToCopy}`);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        }
    });
}

function splitPayment() {
    const circle = document.querySelector(".split_payment_div");

    if (circle.innerHTML === "") {
        circle.innerHTML = "✔";
        document.getElementById('splitPaymentContainer').classList.remove('hidden');
        handleSplitPayment();
    } else {
        circle.innerHTML = "";
        document.getElementById('splitPaymentContainer').classList.add('hidden');
    }
}

function handleSplitPayment() {
    let totalAmount = JSON.parse(localStorage.getItem('orderSummary'))?.total;
    let cashAmount = 0;
    let cardAmount = 0;
    let remainingAmount = totalAmount;

    const paymentAmountInput = document.getElementById('paymentAmount');
    const addPaymentButton = document.getElementById('addPayment');
    const remainingAmountDisplay = document.getElementById('remainingAmount');
    const paymentMethodsContainer = document.getElementById('paymentMethodsContainer');
    const paymentSplitMethodsContainer = document.getElementById('paymentSplitMethodsContainer');

    addPaymentButton.addEventListener('click', function () {
        const paymentAmount = parseFloat(paymentAmountInput.value) || 0;

        if (paymentAmount > 0 && paymentAmount <= remainingAmount) {
            remainingAmount -= paymentAmount;
            updateDisplay();

            // Check if Cash or Card is selected and update respective amounts
            const selectedMethod = Array.from(paymentMethodsContainer.children)
                .find(button => button.classList.contains('active'))
                .dataset.method;

            if (selectedMethod === 'Cash') {
                cashAmount += paymentAmount;
            } else if (selectedMethod === 'Card') {
                cardAmount += paymentAmount;
            }

            updatePaymentMethodDisplay();
        } else {
            paymentAmountInput.value = '';
            alert("Remaining Amount : 0.00");
        }
    });

    function updateDisplay() {
        remainingAmountDisplay.textContent = remainingAmount.toFixed(2);
    }

    function updatePaymentMethodDisplay() {
        Array.from(paymentSplitMethodsContainer.children).forEach(button => {
            const method = button.dataset.method;
            let amount = 0;

            if (method === 'Cash') {
                amount = cashAmount;
            } else if (method === 'Card') {
                amount = cardAmount;
            }

            button.textContent = `${method}: ${amount.toFixed(2)}`;
        });
    }

    // Initialize
    updateDisplay();
}

function handleSettleBill() {
    showLoader();
    const orderDetails = JSON.parse(localStorage.getItem('quickOrderDetails'));
    const success = saveOrderDetails(orderDetails);
    if (success) {
        deleteItems(true);
    }
    document.getElementById('paymentModel').classList.add('hidden');
    hideLoader();
}


function generateUniqueOrderID() {
    const timestamp = Date.now(); // Get current timestamp (milliseconds since Unix epoch)
    const randomNum = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
    const orderID = `ORD-${timestamp}-${randomNum.toString().padStart(4, '0')}`; // Ensure 4-digit padding for random number

    return orderID;
}
