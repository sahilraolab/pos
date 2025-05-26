/*

    // CRED operations

    const staffData = await storeAPI.get('staff');
    await storeAPI.set('staff', [{ name: 'Sahil', id: '123' }]);
    const hasStaff = await storeAPI.has('staff');
    await storeAPI.updateItem('staff', '123', { name: 'Sahil Rao' });
    await storeAPI.delete('staff');
    await storeAPI.clear();
*/

document.addEventListener('DOMContentLoaded', async () => {
    // restartApp();
    // await storeAPI.delete('orders');
    showLoader();
    if (localStorage.getItem('POS_INFO')) {
        hasData = await fetchStoredPOSData();
        console.log(hasData);
        if (hasData) {
            initialSecondScreen();
        } else {

            const data = await fetchAllPOSData();
            console.log(data);

            if (data?.staff?.staff && Array.isArray(data.staff.staff)) {
                await storeAPI.set('staff', data.staff.staff);
            } else {
                alert('Staff info not found!');
            }
            if (data?.tables?.tables && Array.isArray(data.tables.tables)) {
                const tables = data.tables.tables.map(i => ({
                    ...i,
                    tableStatus: "available"
                }));
                await storeAPI.set('tables', tables);

            } else {
                alert('Tables info not found!');
            }
            if (data?.orderTypes?.orderTypes && Array.isArray(data.orderTypes.orderTypes)) {
                await storeAPI.set('orderTypes', data.orderTypes.orderTypes);
            } else {
                alert("Order type info not found!");
            }
            if (data?.paymentTypes?.paymentTypes && Array.isArray(data.paymentTypes.paymentTypes)) {
                await storeAPI.set('paymentTypes', data.paymentTypes.paymentTypes);
            } else {
                alert('Payment type info not found!');
            }
            if (data?.tax?.tax) {
                await storeAPI.set('tax', data.tax.tax);
            } else {
                alert('tax info not found!');
            }
            if (data?.menu?.data?.addons && Array.isArray(data.menu.data.addons)) {
                await storeAPI.set('addons', data.menu.data.addons);
            }
            if (data?.menu?.data?.categories && Array.isArray(data.menu.data.categories)) {
                await storeAPI.set('categories', data.menu.data.categories);
            } else {
                alert('No category found!');
            }
            if (data?.menu?.data?.items && Array.isArray(data.menu.data.items)) {
                await storeAPI.set('items', data.menu.data.items);
            }
            if (data?.discounts?.discounts && Array.isArray(data.discounts.discounts)) {
                const priceModifiers = getPriceModifiers(data.discounts.discounts);
                console.log(priceModifiers);
                await storeAPI.set('priceModifiers', priceModifiers);
            }
            if (data?.offers?.offers && Array.isArray(data.offers.offers)) {
                await storeAPI.set('offers', data.offers.offers);
            }
            initialSecondScreen();
        }

    } else {
        // Initial setup authentication pending!
        initialFirstScreen();
    }
});


async function initialFirstScreen() {
    isInternetAvailable().then(status => {
        console.log(status ? "Internet Available ✅" : "No Internet ❌");
    });
    const initialPosSetupLoginScreen = document.querySelector(".initialPosSetupLoginScreen");
    if (initialPosSetupLoginScreen) {
        initialPosSetupLoginScreen.classList.remove("hidden");
        hideLoader();
        document.getElementById("posForm").addEventListener("submit", async function (event) {
            event.preventDefault();

            const posId = document.getElementById("posIdInput").value.trim();
            const password = document.getElementById("passwordInput").value.trim();

            if (!posId || !password) {
                alert("POS ID and Password are required.");
                hideLoader();
                return;
            }

            try {
                const response = await fetch("http://localhost:5002/api/pos/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: posId, password: password }),
                    credentials: "include" // 🔥 This tells fetch to allow cookies
                });


                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("POS_INFO", JSON.stringify(data.outlet));
                    window.location.reload();
                } else {
                    alert(data.error || "Login failed.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to connect to server.");
            } finally {
                hideLoader();
            }
        });
    }
}

async function initialSecondScreen() {
    const initialPosSetupLoginScreen = document.querySelector(".initialPosSetupLoginScreen");
    initialPosSetupLoginScreen.classList.add('hidden');
    const staffs = await storeAPI.get('staff');
    console.log(staffs);
    const staff = staffs.find(staff => staff.isLoggedIn);
    if (staff) {
        // Staff data found
        showScreensContainer();
        updateCounterTypo(staff);
        const hasDayStart = await storeAPI.has('dayStart');

        if (hasDayStart) {
            // Day already start
            // const response = await shiftAPI.checkPunchIn(staff);
            const punchIns = await storeAPI.get('punchIns');
            const punch = punchIns.find(i => i.status === "Active");

            console.log(punch);

            if (punch) {
                // One active user present  
                showDashboardScreen();
            } else {
                // No active user present
                showPunchInModel(staff);
            }

        } else {
            // Need to run day start
            startDay();
        }
    } else {
        // No users data found
        const counterStaffLoginScreen = document.querySelector(".counterStaffLoginScreen");

        if (counterStaffLoginScreen) {
            counterStaffLoginScreen.classList.remove("hidden");
            hideLoader();

            const keys = document.querySelectorAll(".key");
            let pin = "";

            function updateDots() {
                const dots = document.querySelectorAll(".dot");
                dots.forEach((dot, index) => {
                    dot.textContent = pin[index];
                    dot.classList.toggle("filled", index < pin.length);
                });
            }

            function clearDots() {
                pin = "";
                updateDots();
            }

            async function verifyPin() {
                if (pin.length === 4) {
                    showLoader();

                    const staffs = await storeAPI.get('staff');

                    const matchedStaff = staffs.find(staff => staff.pos_login_pin === pin);

                    if (matchedStaff) {
                        // 👇 You can update/add a field, e.g. `isLoggedIn: true`
                        const updatedStaffs = staffs.map(staff => ({
                            ...staff,
                            isLoggedIn: staff.pos_login_pin === pin
                        }));

                        await storeAPI.set('staff', updatedStaffs);

                        showScreensContainer();
                        clearDots();
                        hideLoader();
                    } else {
                        setTimeout(() => {
                            alert('Incorrect Pin!');
                            clearDots();
                            hideLoader();
                        }, 500);
                    }
                }
            }


            keys.forEach((key) => {
                key.addEventListener("click", () => {
                    if (key.classList.contains("delete")) {
                        pin = pin.slice(0, -1);
                    } else if (pin.length < 4) {
                        pin += key.textContent.trim();
                    }
                    updateDots();
                    verifyPin();
                });
            });
        }
    }
}

// ✅ Fetch and log all stored POS data
const fetchStoredPOSData = async () => {
    try {
        const staff = await storeAPI.get('staff');
        const tables = await storeAPI.get('tables');
        const orderTypes = await storeAPI.get('orderTypes');
        const paymentTypes = await storeAPI.get('paymentTypes');
        const tax = await storeAPI.get('tax');
        const addons = await storeAPI.get('addons');
        const categories = await storeAPI.get('categories');
        const items = await storeAPI.get('items');
        const priceModifiers = await storeAPI.get('priceModifiers');
        const offers = await storeAPI.get('offers');

        console.log('📦 Stored POS Data:');
        console.log('👤 Staff:', staff);
        console.log('🪑 Tables:', tables);
        console.log('🛍️ Order Types:', orderTypes);
        console.log('💳 Payment Types:', paymentTypes);
        console.log('💸 Tax:', tax);
        console.log('➕ Addons:', addons);
        console.log('📂 Categories:', categories);
        console.log('🍔 Items:', items);
        console.log('🎁 priceModifiers:', priceModifiers);
        console.log('🔁 Offers:', offers);
        return (staff && tables && orderTypes && paymentTypes && tax && addons && categories && items && priceModifiers && offers);
    } catch (err) {
        console.error('❌ Error fetching stored POS data:', err);
        return false
    }
};

const fetchAllPOSData = async () => {
    try {
        // 👤 Staff
        const staff = await fetchWithCookies("http://localhost:5002/api/pos/staff");

        // 📋 Menu (menus, categories, items, addons)
        const menu = await fetchWithCookies("http://localhost:5002/api/pos/menu");

        // 🪑 Tables
        const tables = await fetchWithCookies("http://localhost:5002/api/pos/tables");

        // 💸 Tax
        const tax = await fetchWithCookies("http://localhost:5002/api/pos/tax");

        // 🎁 Discounts
        const discounts = await fetchWithCookies("http://localhost:5002/api/pos/discounts");

        // 🔁 Buy X Get Y Offers
        const offers = await fetchWithCookies("http://localhost:5002/api/pos/offers/buy-x-get-y");

        // 🛒 Order Types
        const orderTypes = await fetchWithCookies("http://localhost:5002/api/pos/order-types");

        // 💳 Payment Types
        const paymentTypes = await fetchWithCookies("http://localhost:5002/api/pos/payment-types");

        // You can return all of this if needed
        return {
            staff,
            menu,
            tables,
            tax,
            discounts,
            offers,
            orderTypes,
            paymentTypes
        };

    } catch (err) {
        console.error("Unexpected error fetching POS data:", err);
    }
};

async function updateAllPOSData() {
    const data = await fetchAllPOSData();
    if (!data) {
        alert("❌ Failed to fetch POS data.");
        return;
    }

    try {
        // 👤 Staff
        if (data?.staff?.staff && Array.isArray(data.staff.staff)) {
            await storeAPI.set('staff', data.staff.staff);
        } else {
            alert('❌ Staff info not found!');
        }

        // 🪑 Tables
        if (data?.tables?.tables && Array.isArray(data.tables.tables)) {
            const tables = data.tables.tables.map(table => ({
                ...table,
                tableStatus: "available"
            }));
            await storeAPI.set('tables', tables);
        } else {
            alert('❌ Tables info not found!');
        }

        // 🛍️ Order Types
        if (data?.orderTypes?.orderTypes && Array.isArray(data.orderTypes.orderTypes)) {
            await storeAPI.set('orderTypes', data.orderTypes.orderTypes);
        } else {
            alert("❌ Order types info not found!");
        }

        // 💳 Payment Types
        if (data?.paymentTypes?.paymentTypes && Array.isArray(data.paymentTypes.paymentTypes)) {
            await storeAPI.set('paymentTypes', data.paymentTypes.paymentTypes);
        } else {
            alert('❌ Payment types info not found!');
        }

        // 💸 Tax
        if (data?.tax?.tax) {
            await storeAPI.set('tax', data.tax.tax);
        } else {
            alert('❌ Tax info not found!');
        }

        // ➕ Addons
        if (data?.menu?.data?.addons && Array.isArray(data.menu.data.addons)) {
            await storeAPI.set('addons', data.menu.data.addons);
        }

        // 📂 Categories
        if (data?.menu?.data?.categories && Array.isArray(data.menu.data.categories)) {
            await storeAPI.set('categories', data.menu.data.categories);
        } else {
            alert('❌ No categories found!');
        }

        // 🍔 Items
        if (data?.menu?.data?.items && Array.isArray(data.menu.data.items)) {
            await storeAPI.set('items', data.menu.data.items);
        }

        // 🎁 Discounts
        if (data?.discounts?.discounts && Array.isArray(data.discounts.discounts)) {
            const priceModifiers = getPriceModifiers(data.discounts.discounts);
            console.log(priceModifiers);
            await storeAPI.set('priceModifiers', priceModifiers);
        }

        // 🔁 Offers
        if (data?.offers?.offers && Array.isArray(data.offers.offers)) {
            await storeAPI.set('offers', data.offers.offers);
        }

        alert("✅ All POS data updated successfully.");
    } catch (error) {
        console.error("❌ Error while saving POS data:", error);
        alert("❌ Failed to update some or all POS data.");
    }
}

async function updatePOSData(type) {
    try {
        let result;

        switch (type) {
            case "staff":
                result = await fetchWithCookies("http://localhost:5002/api/pos/staff");
                if (result?.staff && Array.isArray(result.staff)) {
                    await storeAPI.set("staff", result.staff);
                    alert("✅ staff updated.");
                } else {
                    alert("❌ Staff info not found.");
                }
                break;

            case "tables":
                result = await fetchWithCookies("http://localhost:5002/api/pos/tables");
                if (result?.tables && Array.isArray(result.tables)) {
                    const tables = result.tables.map(t => ({
                        ...t,
                        tableStatus: "available"
                    }));
                    await storeAPI.set("tables", tables);
                    alert("✅ tables updated.");
                } else {
                    alert("❌ Tables info not found.");
                }
                break;

            case "orderTypes":
                result = await fetchWithCookies("http://localhost:5002/api/pos/order-types");
                if (result?.orderTypes && Array.isArray(result.orderTypes)) {
                    await storeAPI.set("orderTypes", result.orderTypes);
                    alert("✅ orderTypes updated.");
                } else {
                    alert("❌ Order types not found.");
                }
                break;

            case "paymentTypes":
                result = await fetchWithCookies("http://localhost:5002/api/pos/payment-types");
                if (result?.paymentTypes && Array.isArray(result.paymentTypes)) {
                    await storeAPI.set("paymentTypes", result.paymentTypes);
                    alert("✅ paymentTypes updated.");
                } else {
                    alert("❌ Payment types not found.");
                }
                break;

            case "tax":
                result = await fetchWithCookies("http://localhost:5002/api/pos/tax");
                if (result?.tax) {
                    await storeAPI.set("tax", result.tax);
                    alert("✅ tax updated.");
                } else {
                    alert("❌ Tax info not found.");
                }
                break;

            case "discounts":
                result = await fetchWithCookies("http://localhost:5002/api/pos/discounts");
                if (result?.discounts && Array.isArray(result.discounts)) {
                    const priceModifiers = getPriceModifiers(result.discounts);
                    console.log(priceModifiers);
                    await storeAPI.set("priceModifiers", priceModifiers);
                    alert("✅ discounts updated.");
                } else {
                    alert("❌ Discounts not found.");
                }
                break;

            case "offers":
                result = await fetchWithCookies("http://localhost:5002/api/pos/offers/buy-x-get-y");
                if (result?.offers && Array.isArray(result.offers)) {
                    await storeAPI.set("offers", result.offers);
                    alert("✅ offers updated.");
                } else {
                    alert("❌ Offers not found.");
                }
                break;

            case "addons":
                result = await fetchWithCookies("http://localhost:5002/api/pos/menu");
                if (result?.data?.addons && Array.isArray(result.data.addons)) {
                    await storeAPI.set("addons", result.data.addons);
                    alert("✅ addons updated.");
                } else {
                    alert("❌ Addons not found.");
                }
                break;

            case "categories":
                result = await fetchWithCookies("http://localhost:5002/api/pos/menu");
                if (result?.data?.categories && Array.isArray(result.data.categories)) {
                    await storeAPI.set("categories", result.data.categories);
                    alert("✅ categories updated.");
                } else {
                    alert("❌ Categories not found.");
                }
                break;

            case "items":
                result = await fetchWithCookies("http://localhost:5002/api/pos/menu");
                if (result?.data?.items && Array.isArray(result.data.items)) {
                    await storeAPI.set("items", result.data.items);
                    alert("✅ items updated.");
                } else {
                    alert("❌ Items not found.");
                }
                break;

            default:
                alert("❌ Invalid type provided.");
        }
    } catch (err) {
        console.error(`❌ Failed to update ${type}:`, err);
        alert(`❌ Failed to update ${type}`);
    }
}

function showScreensContainer() {
    const counterStaffLoginScreen = document.querySelector(".counterStaffLoginScreen");
    const screensContainer = document.querySelector('.screensContainer');
    counterStaffLoginScreen.classList.add('hidden');
    screensContainer.classList.remove('hidden');
    hideLoader();
}

async function showDashboardScreen() {
    showLoader();
    switchNavigationSection('dashboardLink', 'dashboardSection');
    const orderTypes = await storeAPI.get('orderTypes');
    showOrderTypes(orderTypes);
    const activeOrderType = orderTypes.find(i => i.isActive);
    if (activeOrderType) {
        handleOrderTypeSelection(activeOrderType.category);
    }
    document.querySelector('.order_type').classList.remove('hidden');
    hideLoader();
}


async function loadMenu() {
    showLoader();
    showMenuCategories();
    hideLoader();
}


const handleOrderTypeSelection = (type) => {
    switch (type) {
        case "pickup":
            toggleOrderType('pickup');
            break;
        case "dine-in":
            toggleOrderType('dine-in');
            break;
        case "quick-service":
            toggleOrderType('quick-service');
            break;
        case "delivery":
            alert("Delivery feature, currently not available");
            break;
        case "third-party":
            alert("Third party feature, currently not available");
            break;
        default:
            break;
    }

}

async function showMenuCategories() {
    const itemContainer = document.getElementById("selectedCategoryMenuList");
    const categoryContainer = document.getElementById("menuCategoryList");

    if (!itemContainer || !categoryContainer) {
        console.error("Container elements not found");
        return;
    }

    // Reset existing content
    itemContainer.innerHTML = "";
    categoryContainer.innerHTML = "";

    // show categories
    const POS_INFO = JSON.parse(localStorage.getItem("POS_INFO"));
    const timeZone = POS_INFO?.timezone?.value || "UTC";

    // Get current date and time in POS time zone
    const now = new Date();
    const zonedTime = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(now);

    // Extract parts
    let currentDay = "";
    let currentHour = "";
    let currentMinute = "";
    zonedTime.forEach(part => {
        if (part.type === 'weekday') currentDay = part.value.toLowerCase();
        if (part.type === 'hour') currentHour = part.value;
        if (part.type === 'minute') currentMinute = part.value;
    });

    const currentTime = `${currentHour.padStart(2, '0')}:${currentMinute.padStart(2, '0')}`;

    const categories = await storeAPI.get('categories');
    const items = await storeAPI.get('items');
    const addons = await storeAPI.get('addons');

    categories
        .filter((category) => {
            const hasDay = category.day && category.day.trim() !== "";
            const hasStart = category.start_time && category.start_time.trim() !== "";
            const hasEnd = category.end_time && category.end_time.trim() !== "";

            // No restriction
            if (!hasDay && !hasStart && !hasEnd) return true;

            // Day mismatch
            if (hasDay && category.day.toLowerCase() !== currentDay) return false;

            // Time range check
            if (hasStart && hasEnd) {
                return currentTime >= category.start_time && currentTime <= category.end_time;
            }

            return false;
        })
        .forEach((category) => {
            const categoryButton = document.createElement("button");
            categoryButton.classList.add("menu_category_button");
            categoryButton.innerText = category.name;

            categoryButton.addEventListener("click", (event) => {
                document.querySelectorAll(".menu_category_button").forEach((btn) =>
                    btn.classList.remove("active")
                );

                event.target.classList.add("active");

                displayItems(category);

                const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
                categoryHeading.innerText = `${category.name} Menu`;
            });

            categoryContainer.appendChild(categoryButton);
        });


    // Display items for the first category by default
    if (categories.length > 0) {
        const firstCategory = categories[0];
        displayItems(firstCategory);
        const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
        categoryHeading.innerText = `${firstCategory.name} Menu`;

        categoryContainer.firstChild.classList.add("active");
    }

    // Function to display items of a specific category
    function displayItems(category) {
        itemContainer.innerHTML = "";
        const categoryItems = items.filter(item => item.category_name === category.name);

        if (categoryItems.length === 0) {
            itemContainer.innerHTML = "<p>No items available in this category.</p>";
            return;
        }
        categoryItems.forEach((item) => {

            // Create a div and set its innerHTML
            const itemWrapper = document.createElement("div");
            // const itemObj = JSON.stringify(item);
            itemWrapper.innerHTML = `
                 <div class="category_menu_item"  onclick="selectProduct(${item})">
                    <div class="imgCon">
                    <img src="${item.image}" alt="${item.name}">
                    </div>
                    <span>${item.name}</span>
                    <div>
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <span>/portion</span>
                    </div>
                </div>
            `;

            // Select the actual item div inside itemWrapper and attach event listener
            const itemElement = itemWrapper.firstElementChild;
            itemElement.addEventListener("click", () => selectProduct(item));

            // Append to container
            itemContainer.appendChild(itemElement);
        });

    }
}

function handleMenuSearch(event) {
    const query = event.target.value.toLowerCase();
    const allMenuItems = document.querySelectorAll(".category_menu_item");

    allMenuItems.forEach((item) => {
        const title = item.querySelector("h3").textContent.toLowerCase();
        const description = item.querySelector(".description").textContent.toLowerCase();
        const addons = item.querySelector(".addons") ? item.querySelector(".addons").textContent.toLowerCase() : "";

        if (title.includes(query) || description.includes(query) || addons.includes(query)) {
            item.style.display = "flex"; // Show matching items
        } else {
            item.style.display = "none"; // Hide non-matching items
        }
    });
}

async function selectProduct(data) {

    data.quantity = 1;
    const addons = await storeAPI.get('addons');
    const categories = await storeAPI.get('categories');
    const applicable = getApplicableAddons(data, addons, categories);

    // console.log("Applicable Addons for", data.name, ":", applicable);


    if (applicable) {
        const addonModelListSection = document.getElementById("addonItems");
        addonModelListSection.innerHTML = ""; // Clear previous content

        applicable.forEach((addon) => {
            const button = document.createElement("button");
            button.classList.add("addon");
            button.innerHTML = `
                <span class="name">${addon.name}</span>
                <span class="price">($${addon.price})</span>
            `;
            button.dataset.addon = JSON.stringify(addon);
            button.addEventListener("click", () => button.classList.toggle("active"));
            addonModelListSection.appendChild(button);
        });

        document.querySelector(".addon_heading").innerText = data.name;
        document.querySelector(".add_on").classList.remove("hidden");

        // Remove existing listeners and add the new one
        const saveButton = document.querySelector(".add_on_bottom .save");
        saveButton.replaceWith(saveButton.cloneNode(true)); // Remove all previous events
        document.querySelector(".add_on_bottom .save").addEventListener("click", () => handleAddons(data));

        document.querySelector(".add_on_bottom .cancel").addEventListener("click", () => {
            document.querySelector(".add_on").classList.add("hidden");
        }, { once: true });

    } else {
        data.activeAddons = [];
        saveSelectedMenu(data);
    }

}

async function handleAddons(data) {
    showLoader(true);

    const addonModelListSection = document.getElementById("addonItems");
    if (!addonModelListSection) {
        console.error("Addon list section not found!");
        hideLoader();
        return;
    }

    const activeAddons = Array.from(addonModelListSection.querySelectorAll(".addon.active")).map(addon => {
        const addonData = JSON.parse(addon.dataset.addon || "{}");
        return addonData;
    });

    data.activeAddons = activeAddons;

    const addonsTotal = activeAddons.reduce((sum, addon) => sum + addon.price, 0);
    data.total_price = data.price + addonsTotal;

    await saveSelectedMenu(data);
}

async function saveSelectedMenu(data) {
    showLoader();
    // console.log("Selected item data:", data);

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);

    if (!orderId) {
        console.error("❌ Order ID not found for type:", activeType);
        hideLoader();
        return;
    }

    const orders = await storeAPI.get('orders');
    const orderIndex = orders.findIndex(i => i.id === orderId);

    if (orderIndex === -1) {
        console.error("❌ Order not found with ID:", orderId);
        hideLoader();
        return;
    }

    // Push the new item into the order's items array
    const order = orders[orderIndex];
    order.items = order.items || [];
    order.items.push(data);

    // Save the updated order
    await storeAPI.updateItem('orders', orderId, order);
    await orderSummaryHandle();

    // Hide add-on modal
    document.querySelector(".add_on")?.classList.add("hidden");

    showSelectedMenuList();

    hideLoader();
}


async function showSelectedMenuList() {
    showLoader();

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);

    const orders = await storeAPI.get('orders');

    const filterOrder = orders.find(i => i.id === orderId);

    const selectedItems = filterOrder.items;

    if (selectedItems && selectedItems.length > 0) {
        await orderSummaryHandle();
        const menuItemsContainer = document.querySelector(".menu_item_list");
        menuItemsContainer.innerHTML = "";

        selectedItems.forEach((item) => {
            const menuItemHTML = `
                <div class="menu_item">
                  <div class="menu_item_name">
                    <span class="menu_item_product_name">${item.name}</span>
                    <span class="menu_item_product_price">$${item.total_price.toFixed(2)}</span>
                  </div>
                  <div class="menu_item_number__price">
                    <span class="menu_item_sub_product_names">${item.activeAddons ? item.activeAddons.map(addon => addon.name).join(', ') : ''}</span>
                    <div>
                      <button class="sub">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.25012 8.99997H15.7501" stroke="#2B2B2B" stroke-width="1.125" stroke-linecap="round" />
                        </svg>
                      </button>
                      <input type="text" class="menu_numbers" value="${item.quantity}">
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

            async function updateItemCount(newCount) {
                let count = parseInt(newCount);
                const totalAddonPrice = item.activeAddons?.reduce((acc, addon) => acc + addon.price, 0) || 0;

                if (isNaN(count) || count < 1) {
                    // Remove only the exact instance (not all similar ones)
                    const index = filterOrder.items.findIndex(i => i === item);
                    if (index !== -1) {
                        filterOrder.items.splice(index, 1); // Remove this exact item
                        await storeAPI.updateItem('orders', filterOrder.id, filterOrder);
                        await orderSummaryHandle();
                        menuItemsContainer.removeChild(menuItemElement);
                        console.log("🗑️ Deleted specific item from order", item);
                    }
                } else {
                    // Update quantity and total price
                    item.quantity = count;
                    item.total_price = (item.price + totalAddonPrice) * count;
                    menuNumbersInput.value = count;
                    menuPriceElement.textContent = `$${item.total_price.toFixed(2)}`;

                    // Find and update only this specific item
                    const index = filterOrder.items.findIndex(i => i === item);
                    if (index !== -1) {
                        filterOrder.items[index] = item; // technically redundant, but good for clarity
                        await storeAPI.updateItem('orders', filterOrder.id, filterOrder);
                        await orderSummaryHandle();
                        console.log("✅ Updated quantity for specific item", item);
                    }
                }
                showSelectedMenuList();
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

        if (filterOrder?.customer && filterOrder?.customer?.name) {
            handleQuickPlaceOrder();
        } else {
            handleBackToMenuList();
        }

        document.querySelector(".right_aside").classList.remove("hidden");

    } else {
        document.querySelector(".right_aside").classList.add("hidden");
    }
    hideLoader();
}




/* -------------------------
    Table handlers start
------------------------- */

async function showSelectTableScreen(tables) {
    showLoader();
    const tablesSectionScreen = document.querySelector('.tables_section');
    const menuContainerScreen = document.querySelector('.menu_container');
    tablesSectionScreen.classList.remove('hidden');
    menuContainerScreen.classList.add('hidden');
    try {

        creteAreaSelection(tables);
        adjectTableTop();

        const statusButtons = document.querySelectorAll(".status_indication_filter_main button");

        statusButtons.forEach(button => {
            button.addEventListener("click", () => {
                resetSearch();
                statusButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                const selectedStatus = button.dataset.type; // Get selected status
                sortTables(selectedStatus);
            });
        });

        const searchInput = document.querySelector(".table_search input");
        searchInput.addEventListener("input", function () {
            const searchValue = searchInput.value.toLowerCase();
            filterTables(searchValue);
        });

        // const orderId = await getOrderIdByType(ORDERTYPE);
        // document.getElementById('dineInOrderId').textContent = `Order #${orderId}`


    } catch (error) {
        console.error("Error fetching tables:", error.message);
    } finally {
        hideLoader();
    }
}

function creteAreaSelection(tables) {
    const areaSectionAside = document.querySelector('.table_aside');
    areaSectionAside.innerHTML = "";
    const uniqueAreas = [...new Set(tables.map(table => table.floor_id))];
    uniqueAreas.forEach((floor, index) => {

        const button = document.createElement('button');

        // Convert "Ground Floor" -> "GF", "First Floor" -> "FF", "Rooftop" -> "R"
        const floorCode = floor.floor_name.split(' ').map(word => word[0]).join('').toUpperCase();

        button.textContent = `${floorCode}`;
        button.dataset.floor = JSON.stringify(floor);
        button.addEventListener('click', () => toggleAreaSelection(button));
        areaSectionAside.appendChild(button);
    });

    document.querySelectorAll('.table_aside button')[0].click();

}

function toggleAreaSelection(button) {
    resetSearch();
    button.classList.toggle('active');
    createTableElements();
}

async function createTableElements() {

    const tablesSection = document.querySelector('.dineTable-section');
    tablesSection.innerHTML = "";
    const filteredFloors = [];
    const areaBtnsMain = document.querySelectorAll('.table_aside button.active');
    if (areaBtnsMain) {
        areaBtnsMain.forEach((item) => {
            filteredFloors.push(JSON.parse(item.dataset.floor));
        })
    }

    const tables = await storeAPI.get('tables');
    let tablesData = tables;

    const sortedTables = tablesData.filter(table =>
        filteredFloors.some(floor => floor._id === table.floor_id._id)
    );

    console.log(sortedTables);
    const shapeOrder = { rectangle: 1, square: 2, circle: 3 };
    sortedTables.sort((a, b) => shapeOrder[a.shape] - shapeOrder[b.shape]);

    sortedTables.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.classList.add('dineTable', table.type, `status-${table.tableStatus}`);
        tableDiv.id = table._id;

        // Restore saved position if exists
        const positions = JSON.parse(localStorage.getItem("tablePositions") || "{}");
        const savedPosition = positions[table._id];

        if (savedPosition) {
            tableDiv.style.position = "absolute";
            tableDiv.style.left = `${savedPosition.left}px`;
            tableDiv.style.top = `${savedPosition.top}px`;
        }


        if (table.selected) {
            tableDiv.classList.add("selected");
            showSelectedTable(table);
        }

        const seatsDiv = document.createElement('div');
        seatsDiv.classList.add('seats');

        const sides = ['top', 'bottom', 'left', 'right'];
        const seats = distributeSeats(table.shape) || { top: 0, bottom: 0, left: 0, right: 0 }; // Fixed: Ensure it returns valid object

        sides.forEach(side => {
            const sideDiv = document.createElement('div');
            sideDiv.classList.add('side', side);

            for (let i = 0; i < seats[side]; i++) {
                const seat = document.createElement('div');
                seat.classList.add('seat');
                sideDiv.appendChild(seat);
            }
            seatsDiv.appendChild(sideDiv);
        });

        // Create table info
        const tableInfo = document.createElement('div');
        tableInfo.classList.add('table-info');
        tableInfo.innerHTML = `<p>${table.table_name}</p><span>Seats: ${table.sitting}</span>`;

        // Append elements to tableDiv
        tableDiv.appendChild(tableInfo);
        tableDiv.appendChild(seatsDiv);

        // Add click event
        tableDiv.addEventListener('click', () => selectTable(table, tableDiv));

        // Enable draggable
        tableDiv.setAttribute("draggable", "true");

        // Add drag events
        tableDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", table._id);
        });

        tablesSection.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necessary to allow dropping
        });

        tablesSection.addEventListener("drop", (e) => {
            e.preventDefault();
            const tableId = e.dataTransfer.getData("text/plain");
            const draggedTable = document.getElementById(tableId);

            // Get new position
            const offsetX = e.offsetX;
            const offsetY = e.offsetY;

            draggedTable.style.position = "absolute";
            draggedTable.style.left = `${offsetX}px`;
            draggedTable.style.top = `${offsetY}px`;

            // Save position in localStorage
            saveTablePosition(tableId, offsetX, offsetY);
        });

        // Append table to the section
        tablesSection.appendChild(tableDiv);
    });
    const filteredStatus = document.querySelector(".status_indication_filter_main button.active")?.dataset.type || "all";
    sortTables(filteredStatus);
}

function filterTables(searchValue) {
    const tables = document.querySelectorAll('.dineTable');

    tables.forEach(table => {
        const tableNumber = table.querySelector('.table-info p').textContent.toLowerCase();
        const tableArea = table.dataset.area?.toLowerCase() || ''; // Ensure dataset exists

        if (tableNumber.includes(searchValue.toLowerCase()) || tableArea.includes(searchValue.toLowerCase())) {
            table.classList.remove('hidden'); // Show matching tables
        } else {
            table.classList.add('hidden'); // Hide non-matching tables
        }
    });
}

function sortTables(selectedStatus) {
    console.log(selectedStatus);
    const tables = document.querySelectorAll('.dineTable');

    tables.forEach(table => {
        if (selectedStatus === "all") {
            table.classList.remove("hidden"); // Show all tables
        } else if (table.classList.contains(`status-${selectedStatus}`)) {
            table.classList.remove("hidden"); // Show matching status
        } else {
            table.classList.add("hidden"); // Hide non-matching status
        }
    });
}

function resetSearch() {
    const searchInput = document.querySelector('.table_search input');
    searchInput.value = ''; // Clear input field

    const tables = document.querySelectorAll('.dineTable');
    tables.forEach(table => {
        table.classList.remove('hidden'); // Show all tables
    });
}

async function selectTable(table, tableDiv) {
    if (table.status === 'available') {
        tableDiv.classList.toggle('selected');
        if (tableDiv.classList.toString().includes('selected')) {
            // add table
            showSelectedTable(table);
        } else {
            // remove table
            removeSelectedTable(table);
        }
    } else {
        if (table.status === 'available_soon') {
            alert(`${table.tableNumber} will available soon.`);
        } else {
            alert(`${table.tableNumber} is not available.`);
        }
    }
}

function showSelectedTable(table) {
    const container = document.querySelector('.selected_tables_info');
    if (!container || container.querySelector(`[data-table="${table.tableNumber}"]`)) return;

    const tableDiv = document.createElement('div');
    tableDiv.setAttribute('data-table', table.tableNumber);
    tableDiv.innerHTML = `
        <button class="remove-table">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M2.08334 2.0835L7.91668 7.91683M7.91668 2.0835L2.08334 7.91683"
                    stroke="white" stroke-width="1.5" stroke-linecap="round" />
            </svg>
        </button>
        <span>${table.tableNumber}</span>
    `;

    // Attach remove event listener
    tableDiv.querySelector('.remove-table').addEventListener('click', () => removeSelectedTable(table));

    container.appendChild(tableDiv);
}

function removeSelectedTable(table) {
    const tableElement = document.querySelector(`[data-table="${table.tableNumber}"]`);
    if (tableElement) tableElement.remove();
    const selectedTableOnMainView = document.getElementById(table.tableNumber);
    if (selectedTableOnMainView) selectedTableOnMainView.classList.remove('selected');
}

async function handleTableSelection() {
    showLoader();

    try {
        const selectedTables = document.querySelectorAll(".rightSide.selected_tables_info div[data-table]");
        if (selectedTables.length === 0) {
            console.warn("No tables selected!");
            hideLoader();
            return;
        }

        const orderId = Number(document.getElementById('dineInOrderId').innerText.split("#")[1]);
        const updatePromises = [];

        selectedTables.forEach(table => {
            const tableNumber = table.dataset.table;
            console.log(tableNumber)
            console.log(orderId)
            updatePromises.push(tableAPI.updateTableSelection(tableNumber, orderId, 1));
        });

        // Execute all updates asynchronously
        const results = await Promise.all(updatePromises);

        console.log("Tables updated successfully:", results);

        const tablesSectionScreen = document.querySelector('.tables_section');
        const menuContainerScreen = document.querySelector('.menu_container');
        tablesSectionScreen.classList.add('hidden');
        menuContainerScreen.classList.remove('hidden');
        document.getElementById('dashboardSection').style.removeProperty('padding');
        // const res = await 

    } catch (error) {
        console.error("Error updating tables:", error);
    } finally {
        hideLoader();
    }
}

/* -------------------------
    Table handlers end
------------------------- */



function showOngoingOrdersScreen() {
    showLoader();
    switchNavigationSection('ongoingOrderLink', 'ongoingOrdersSection');
    document.getElementById('rightAside').classList.add('hidden');
    // Trigger the ALL button properly
    const allButton = document.getElementById("orders-container-all-btn");
    if (allButton) {
        filterOrders({ target: allButton }); // Call function with simulated event
    }
    hideLoader();
}

function showBillsScreen() {
    showLoader();
    switchNavigationSection('billsSectionLink', 'billsSection');
    hideLoader();
}

function showSettingScreen() {
    showLoader();
    switchNavigationSection('settingSectionLink', 'settingSection');
    document.getElementById('rightAside').classList.add('hidden');
    const buttons = document.querySelectorAll("#settingsMenu .light-btn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove("active"));

            // Add active class to clicked button
            this.classList.add("active");

            // Execute the corresponding function
            const setting = this.getAttribute("data-setting");
            if (setting === "general") {
                showGeneralSettings();
            } else if (setting === "printer") {
                showPrinterSettings();
            } else if (setting === "kds") {
                showKdsSettings();
            }
        });
    });

    showGeneralSettings();
    document.querySelector('.order_type').classList.add('hidden');
    hideLoader();
}


function showGeneralSettings() {
    const printerContainer = document.getElementById('printerContainer');
    const kdsContainer = document.getElementById("kdsContainer");
    const generalContainer = document.getElementById("generalContainer");
    kdsContainer.classList.add('hidden');
    generalContainer.classList.remove('hidden');
    printerContainer.classList.add('hidden');
}

async function showPrinterSettings() {
    const printerContainer = document.getElementById('printerContainer');
    const kdsContainer = document.getElementById("kdsContainer");
    const generalContainer = document.getElementById("generalContainer");
    kdsContainer.classList.add('hidden');
    generalContainer.classList.add('hidden');
    printerContainer.classList.remove('hidden');
    // Initial UI load
    await renderPrinters();
    await loadDefaultPrinter();
}

function showKdsSettings() {
    alert('kds');
}



async function handleInputChange(e) {
    const { name, value } = e.target;

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);

    // Ensure customer object exists
    if (!order.customer) {
        order.customer = {};
    }

    // Update only the specific field
    if (name === "fullName") {
        order.customer.name = value;
    } else if (name === "kotNote") {
        order.customer.note = value;
    } else {
        order.customer[name] = value;
    }

    // 🔍 Autofill if email or phone is entered
    if (name === "email" || name === "phone") {
        const matchedOrders = orders.filter(o => o.customer?.[name] === value);

        if (matchedOrders.length > 0) {
            const matchedCustomer = matchedOrders[0].customer;

            // Autofill all fields if they are empty
            if (!order.customer.name && matchedCustomer.name) {
                order.customer.name = matchedCustomer.name;
                document.getElementById("fullName").value = matchedCustomer.name;
            }

            if (!order.customer.email && matchedCustomer.email) {
                order.customer.email = matchedCustomer.email;
                document.getElementById("email").value = matchedCustomer.email;
            }

            if (!order.customer.phone && matchedCustomer.phone) {
                order.customer.phone = matchedCustomer.phone;
                document.getElementById("phone").value = matchedCustomer.phone;
            }

            if (!order.customer.note && matchedCustomer.note) {
                order.customer.note = matchedCustomer.note;
                document.getElementById("kotNote").value = matchedCustomer.note;
            }

            // 🧾 Save customer's order history
            const orderHistory = matchedOrders.map(o => ({
                orderId: o.id,
                subtotal: o.subtotal || 0,
                total: o.total || 0,
                createdAt: o.createdAt || "N/A"
            }));

            console.log("🧾 Matched customer order history:", orderHistory);
        }
    }

    // Save back to store
    await storeAPI.updateItem('orders', order.id, order);
    console.log("✅ Updated order:", order);
}


// Renders list of printers with buttons to set default
const renderPrinters = async () => {
    const printerList = document.getElementById('printerList');
    const printers = await printerAPI.list();
    printerList.innerHTML = '';

    if (printers.length === 0) {
        printerList.innerHTML = '<p>No USB printers found.</p>';
        return;
    }

    printers.forEach(printer => {
        const btn = document.createElement('button');
        btn.textContent = `USB Printer ${printer.vendorId}:${printer.productId}`;
        btn.onclick = async () => {
            await printerAPI.setDefault(printer);
            await loadDefaultPrinter();
            alert('✅ Default printer set');
        };
        btn.style.margin = '5px';
        printerList.appendChild(btn);
    });
};

// Displays the default printer
const loadDefaultPrinter = async () => {
    const printer = await printerAPI.getDefault();
    const defaultPrinterDisplay = document.getElementById('defaultPrinter');
    defaultPrinterDisplay.textContent = printer
        ? `🖨️ Default Printer: USB ${printer.vendorId}:${printer.productId}`
        : '⚠️ No default printer set';
};

const printDataHere = async () => {
    const result = await printerAPI.print('🧾 Hello from POS! This is your receipt.\n\n');
    if (result.success) {
        alert('✅ Printed and drawer opened');
    } else {
        alert('❌ Print failed: ' + result.error);
    }
}