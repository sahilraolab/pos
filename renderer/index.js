
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    if (POS_INFO) {
        // Initial setup authentication done allready!
        initialSecondScreen();
    } else {
        // Initial setup authentication pending!
        initialFirstScreen();
    }
});


async function initialFirstScreen() {

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
                const response = await fetch("http://localhost:3000/api/pos_setup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pos_id: posId, password: password }),
                });

                const data = await response.json();

                if (response.ok) {
                    POS_INFO = data.data;
                    initialSecondScreen();
                    // Fetch tables from remote server
                    // const tableRequestBody = {
                    //     brand_id: POS_INFO.brand_id,
                    //     outlet_id: POS_INFO.outlet_id
                    // }
                    // const tableResponse = await fetch("http://localhost:3000/api/area_and_tables", {
                    //     method: "POST",
                    //     headers: { "Content-Type": "application/json" },
                    //     body: JSON.stringify(tableRequestBody),
                    // });

                    // const tableData = await tableResponse.json();

                    // if (!tableResponse.ok) {
                    //     throw new Error(data.message || "Failed to fetch tables.");
                    // }

                    // const tables = tableData.data;
                    // console.log("Fetched Tables:", tables);

                    // // Store tables into local Express app
                    // tables.map(async (item) => {
                    //     await tableAPI.createTable(item);
                    // })

                    // console.log("Tables stored successfully in local Express app!");
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
    const response = await userAPI.fetchUsers();
    const users = response.data;
    if (Array.isArray(users) && users.some(user => user.status === "Active")) {
        // Users data found
        const currentUser = users.find(user => user.status === "Active");

        showScreensContainer();
        updateCounterTypo(currentUser);
        const response = await dayStartAPI.fetchDayStarts();
        const dayStart = response.data;

        if (Array.isArray(dayStart) && dayStart.length > 0) {
            // Day already start
            const response = await shiftAPI.checkPunchIn(currentUser.user_id);
            const punchedIn = response.punchedIn;

            if (punchedIn) {
                // One active user present  
                showDashboardScreen();
                loadMenu();
            } else {
                // No active user present
                showPunchInModel(currentUser);
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
                    const requestBody = {
                        brand_id: POS_INFO.brand_id,
                        outlet_id: POS_INFO.outlet_id,
                        pin: pin,
                    };

                    try {
                        const response = await fetch("http://localhost:3000/api/counter_staff_verification", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(requestBody),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.message || "Failed to verify PIN. Please check your credentials.");
                        }

                        const updatedStaff = data.all_staff.map(user => ({
                            ...user,
                            status: user.user_id === data.staff.user_id ? "Active" : "Inactive"
                        }));

                        const updatedData = { ...data, all_staff: updatedStaff };

                        updatedData.all_staff.forEach(async (item) => {
                            await userAPI.createUser(item);
                        })

                        showScreensContainer();

                    } catch (error) {
                        console.error("❌ Error during PIN verification:", error);

                        if (error.message.includes("Failed to fetch")) {
                            alert("Unable to connect to the server. Please check your internet connection and try again.");
                        } else {
                            alert(error.message);
                        }

                        clearDots();
                    } finally {
                        hideLoader();
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

function showScreensContainer() {
    const counterStaffLoginScreen = document.querySelector(".counterStaffLoginScreen");
    const screensContainer = document.querySelector('.screensContainer');
    counterStaffLoginScreen.classList.add('hidden');
    screensContainer.classList.remove('hidden');
    hideLoader();
}

function showDashboardScreen() {
    showLoader();

    switch (ORDERTYPE) {
        case "DINEIN":
            showDineInScreen();
            break;
        case "PICKUP":
            showPickupScreen();
            break;
        case "QUICKBILL":
            showQuickBillScreen();
            break;

        default:
            showQuickBillScreen();
            break;
    }

    hideLoader();
}


async function loadMenu() {
    showLoader(true);
    try {

        const requestBody = {
            brand_id: POS_INFO.brand_id,
            outlet_id: POS_INFO.outlet_id
        }

        const response = await fetch("http://localhost:3000/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to verify PIN. Please check your credentials.");
        }

        const menu = data.data;
        console.log(menu);
        showMenuCategories(menu);
    } catch (error) {
        console.error("Error loading menu:", error);
    } finally {
        hideLoader();
    }
}


function showMenuCategories(menu) {
    const itemContainer = document.getElementById("selectedCategoryMenuList");
    const categoryContainer = document.getElementById("menuCategoryList");

    if (!itemContainer || !categoryContainer) {
        console.error("Container elements not found");
        return;
    }

    // Reset existing content
    itemContainer.innerHTML = "";
    categoryContainer.innerHTML = "";

    // Extract unique categories from menu items
    const categories = [...new Set(menu.flatMap(item => item.categories))];

    categories.forEach((category) => {
        const categoryButton = document.createElement("button");
        categoryButton.classList.add("menu_category_button");
        categoryButton.innerText = category;  // Since category is a string
        categoryButton.addEventListener("click", (event) => {
            document
                .querySelectorAll(".menu_category_button")
                .forEach((button) => button.classList.remove("active"));
            event.target.classList.add("active");

            displayItems(category);

            // Update category heading
            const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
            categoryHeading.innerText = `${category} Menu`;
        });
        categoryContainer.appendChild(categoryButton);
    });

    // Display items for the first category by default
    if (categories.length > 0) {
        const firstCategory = categories[0];
        displayItems(firstCategory);

        const categoryHeading = document.querySelector(".choosen_category_menu_items h3");
        categoryHeading.innerText = `${firstCategory} Menu`;

        categoryContainer.firstChild.classList.add("active");
    }

    // Function to display items of a specific category
    function displayItems(category) {
        itemContainer.innerHTML = "";
        const categoryItems = menu.filter(item => item.categories.includes(category));

        if (categoryItems.length === 0) {
            itemContainer.innerHTML = "<p>No items available in this category.</p>";
            return;
        }

        categoryItems.forEach((item) => {
            const addonsList = item.addons.map(addon => addon.name).join(", ");

            // Create a div and set its innerHTML
            const itemWrapper = document.createElement("div");
            itemWrapper.innerHTML = `
                <div class="category_menu_item" id="menu${item.id}"
                style="display: flex; flex-direction: column; padding: 15px; border: 1px solid #ddd; border-radius: 8px; width: 300px; background-color: #fff; cursor: pointer; transition: 0.3s;">
                    <div class="details" style="display: flex; flex-direction: column;">
                        <h3 style="margin: 0; font-size: 18px; color: #333;">${item.name}</h3>
                        <p class="description" style="margin: 5px 0; font-size: 14px; color: #666;">
                        ${item.description}
                        </p>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span class="price" style="font-weight: bold; font-size: 16px; color: #27ae60;">$${item.price} </span>
                            <span style="font-size: 14px; color: #888;">per serving</span>
                        </div>
                        <div class="addons" style="margin-top: 8px; font-size: 14px; color: #444;">
                            <strong style="color: #222;">Add-ons:</strong> ${addonsList || "None"}
                        </div>
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

    const orderId = await getOrderIdByType(ORDERTYPE);
    let dataObj = { ...data, quantity: 1, total_price: data.price, order_type: ORDERTYPE, order_id: orderId };

    if (dataObj.addons && dataObj.addons.length > 0) {

        const addonModelListSection = document.getElementById("addonItems");
        addonModelListSection.innerHTML = ""; // Clear previous content

        dataObj.addons.forEach((addon) => {
            const button = document.createElement("button");
            button.classList.add("addon");
            button.innerHTML = `
                <span class="name">${addon.name}</span>
                <span class="price">($${addon.price})</span>
            `;
            button.addEventListener("click", () => button.classList.toggle("active"));
            addonModelListSection.appendChild(button);
        });

        document.querySelector(".addon_heading").innerText = dataObj.name;
        document.querySelector(".add_on").classList.remove("hidden");

        // Remove existing listeners and add the new one
        const saveButton = document.querySelector(".add_on_bottom .save");
        saveButton.replaceWith(saveButton.cloneNode(true)); // Remove all previous events
        document.querySelector(".add_on_bottom .save").addEventListener("click", () => handleAddons(dataObj));

        document.querySelector(".add_on_bottom .cancel").addEventListener("click", () => {
            document.querySelector(".add_on").classList.add("hidden");
        }, { once: true });

    } else {
        await saveSelectedMenu(dataObj);
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
        const name = addon.querySelector(".name")?.textContent.trim() || "Unknown";
        const priceText = addon.querySelector(".price")?.textContent.trim() || "$0";
        const price = parseFloat(priceText.replace(/[($)]/g, "")) || 0; // Extract price as a number

        return { name, price };
    });

    data.activeAddons = activeAddons;

    const addonsTotal = activeAddons.reduce((sum, addon) => sum + addon.price, 0);
    data.total_price = data.price + addonsTotal;

    await saveSelectedMenu(data);
}


async function saveSelectedMenu(data) {
    showLoader(true);
    console.log(data);
    try {
        // Create Menu Item
        const response = await selectedMenuItemsAPI.createMenuItem(data);

        if (!response.success) {
            throw new Error(response.error || "Something went wrong while adding menu items.");
        }

        document.querySelector(".add_on").classList.add("hidden");

        showSelectedMenuList();

    } catch (error) {
        console.error("Error in saveSelectedMenu:", error);
        alert(error.message || "An unexpected error occurred.");
    } finally {
        hideLoader();
    }
}

async function showSelectedMenuList() {
    showLoader();
    const orderId = await getOrderIdByType(ORDERTYPE);
    const response = await selectedMenuItemsAPI.fetchMenuItemsByOrder(orderId);
    const selectedItems = response.data;

    if (selectedItems) {
        const menuItemsContainer = document.querySelector(".menu_item_list");
        menuItemsContainer.innerHTML = "";

        selectedItems.forEach((item) => {
            item = parseJSONStringFields(item);
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
                if (isNaN(count) || count < 1) {
                    menuItemsContainer.removeChild(menuItemElement);
                    // remove the entry from the db here
                    await selectedMenuItemsAPI.deleteMenuItem(item.id);
                } else {
                    item.quantity = count;
                    menuNumbersInput.value = count;
                    const totalAddonPrice = item.activeAddons ? item.activeAddons.reduce((acc, addon) => acc + addon.price, 0) : 0;
                    item.total_price = (item.price + totalAddonPrice) * count;
                    // Update the price display
                    menuPriceElement.textContent = `$${item.total_price.toFixed(2)}`;
                    // update entry in db here
                    await selectedMenuItemsAPI.updateMenuItem(item);
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


    }
    document.querySelector(".right_aside").classList.remove("hidden");
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

        const orderId = await getOrderIdByType(ORDERTYPE);
        document.getElementById('dineInOrderId').textContent = `Order #${orderId}`


    } catch (error) {
        console.error("Error fetching tables:", error.message);
    } finally {
        hideLoader();
    }
}

function creteAreaSelection(tables) {
    const areaSectionAside = document.querySelector('.table_aside');
    areaSectionAside.innerHTML = "";
    const uniqueAreas = [...new Set(tables.map(table => table.area))];
    uniqueAreas.forEach((area, index) => {
        const button = document.createElement('button');

        // Convert "Ground Floor" -> "GF", "First Floor" -> "FF", "Rooftop" -> "R"
        const areaCode = area.split(' ').map(word => word[0]).join('').toUpperCase();

        button.textContent = `${areaCode}`;
        button.dataset.area = area;
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
    const filteredAreas = [];
    const areaBtnsMain = document.querySelectorAll('.table_aside button.active');
    if (areaBtnsMain) {
        areaBtnsMain.forEach((item) => {
            filteredAreas.push(item.dataset.area);
        })
    }

    const response = await tableAPI.fetchTables();
    const tables = response.data; // Tables received from the API
    let tablesData = tables;

    const sortedTables = tablesData
        .filter(table => filteredAreas.includes(table.area)) // Filter by area

    console.log(sortedTables);
    const shapeOrder = { rectangle: 1, square: 2, circle: 3 };
    sortedTables.sort((a, b) => shapeOrder[a.shape] - shapeOrder[b.shape]);

    sortedTables.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.classList.add('dineTable', table.shape, `status-${table.status}`);
        tableDiv.id = table.tableNumber;

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
        tableInfo.innerHTML = `<p>${table.tableNumber}</p><span>Seats: ${table.seatingCapacity}</span>`;

        // Append elements to tableDiv
        tableDiv.appendChild(tableInfo);
        tableDiv.appendChild(seatsDiv);

        // Add click event
        tableDiv.addEventListener('click', () => selectTable(table, tableDiv));

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



async function showDineInScreen() {
    showLoader();
    ORDERTYPE = DINEIN;
    toggleOrderType();

    const response = await tableAPI.fetchTables();
    const orderId = await getOrderIdByType(ORDERTYPE);
    const tables = response.data;

    const hasOrderId = tables.some(table => table.order_id === orderId);


    if (hasOrderId) {
        showMenuContainerScreen();
        // await selectedMenuItemsAPI.deleteMenuItem(20);
        showSelectedMenuList();
    } else {
        showSelectTableScreen();
    }

    hideLoader();
}

function showPickupScreen() {
    showLoader();
    ORDERTYPE = PICKUP;
    toggleOrderType();
    showMenuContainerScreen();
    hideLoader();
}

function showQuickBillScreen() {
    showLoader();
    ORDERTYPE = QUICKBILL;
    toggleOrderType();
    showMenuContainerScreen();
    hideLoader();
}