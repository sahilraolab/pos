async function restartApp() {
    // 1. Clear electron-store
    await storeAPI.clear();

    // 2. Clear localStorage
    localStorage.clear();

    // 3. Reload the app
    location.reload(); // or use window.location.href = '/' if routing is set up
}

// restartApp();
async function isInternetAvailable() {
    if (!navigator.onLine) return false; // Quick check for offline mode

    try {
        const response = await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" });
        return true; // If fetch works, internet is available
    } catch (error) {
        return false; // If fetch fails, no internet
    }
}

function showLoader() {
    // Show overlay and loader
    document.querySelector(".loader-container").classList.remove("hidden");

    // Disable interactions with form elements
    const formElements = document.querySelectorAll(
        "input, button,select, textarea"
    );
    formElements.forEach((element) => {
        element.disabled = true;
    });

    // Optionally disable scrolling
    document.body.style.overflow = "hidden";
}

function hideLoader() {
    // Hide overlay and loader
    document.querySelector(".loader-container").classList.add("hidden");

    // Enable interactions with form elements
    const formElements = document.querySelectorAll(
        "input, button,select, textarea"
    );
    formElements.forEach((element) => {
        element.disabled = false;
    });

    // Optionally enable scrolling
    document.body.style.overflow = "auto";
}

// ✅ Utility function to fetch with cookies included
const fetchWithCookies = async (url) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include" // 🔥 Sends cookies like pos_token
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`${response.status} ${response.statusText} - ${errorBody.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
};

function generateIdWithTimestamp(prefix = "id") {
    const timestamp = Date.now(); // milliseconds since Jan 1, 1970
    const random = Math.floor(Math.random() * 1000); // add some randomness
    return `${prefix}_${timestamp}_${random}`;
}

function formatOrderId(rawId) {
    const timestamp = parseInt(rawId.split("_")[1], 10);
    const date = new Date(timestamp);
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20250531
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char code
    return `ORD-${datePart}-${randomSuffix}`;
}



function convertToDBTimeFormat(isoString) {
    const POS_INFO = JSON.parse(localStorage.getItem("POS_INFO"));
    const timeZone = POS_INFO?.timezone?.value || "UTC"; // fallback to UTC
    const date = new Date(isoString);

    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
}


function updateCounterTypo(staff) {
    console.log(staff);
    document.querySelectorAll('.counter_user_name').forEach((item) => {
        item.textContent = staff.name + "!";
    })
    document.querySelector('.counter_user_role').textContent = staff.role_name;
}

function getFormattedDate() {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "2-digit", weekday: "long" };
    return today.toLocaleDateString("en-US", options);
}


function convertToDBTimeFromat(value) {
    return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}


async function toggleOrderType(type, newOrder) {
    showLoader();
    setActiveOrderType(type);
    const dashboardSection = document.getElementById("dashboardSection");
    const dashboardLink = document.getElementById("dashboardLink");
    const selected_menu = document.querySelector(".selected_menu");
    const menu_offers = document.querySelector(".menu_offers");

    // Ensure elements exist before modifying classList
    if (dashboardSection) dashboardSection.classList.remove('disable');
    if (selected_menu) selected_menu.classList.remove('disable');
    if (menu_offers) menu_offers.classList.remove('disable');

    const orderId = generateIdWithTimestamp('order');

    const orders = await storeAPI.get('orders') || [];

    // Check if a similar order (same type, status=start) already exists
    const existingOrder = orders.find(order => order.orderType === type && !order.onHold && (order.status === 'start' || order.status === "in-kitchen"));
    if (!existingOrder) {
        // If not found, create and save the new order
        const newOrder = { id: orderId, orderType: type, status: 'start' };
        const updatedOrders = [...orders, newOrder];
        await storeAPI.set('orders', updatedOrders);
        await orderSummaryHandle();
        console.log("New order added:", newOrder);
        localStorage.setItem(type, newOrder.id);
    } else {
        localStorage.setItem(type, existingOrder.id);
        console.log("Order with same type and status 'start' already exists. Not adding a new one.");
    }


    if (type === "dine-in") {
        // const orderId = await getOrderIdByType(ORDERTYPE);

        // const hasOrderId = tables.some(table => table.order_id === orderId);

        const tables = await storeAPI.get('tables');

        console.log(tables);


        if (false) {
            showMenuContainerScreen();
            // await selectedMenuItemsAPI.deleteMenuItem(20);
            showSelectedMenuList();
        } else {
            showSelectTableScreen(tables);
            showSelectedMenuList();
        }
    } else {
        showMenuContainerScreen();
        loadMenu();
        showSelectedMenuList();
    }


    document.querySelectorAll('.left_aside button').forEach((item) => {
        item.classList.remove('active');
    });
    // Show the dashboard section, enable order type link & dashboard sidebar link
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    if (dashboardLink) dashboardLink.classList.add('active');
    hideLoader();
}

function adjectTableTop() {
    requestAnimationFrame(() => {
        const tableTop = document.querySelector('.table_top');
        if (tableTop) {
            const tableTopHeight = tableTop.getBoundingClientRect().height;
            if (tableTopHeight) {
                const tableAside = document.querySelector('.table_aside');
                const dineTableSection = document.querySelector('.dineTable-section');

                tableAside.style.bottom = tableTopHeight + "px";
                dineTableSection.style.paddingTop = tableTopHeight + "px";

                const tableAsideWidth = tableAside.getBoundingClientRect().width;
                dineTableSection.style.paddingRight = (tableAsideWidth + 20) + "px";

                document.getElementById('dashboardSection').style.padding = 0;
            }
        }
    });
}


function distributeSeats(shape) {
    const seatsMap = {
        circle: { top: 1, bottom: 1, left: 1, right: 1 },
        square: { top: 1, bottom: 1, left: 1, right: 1 },
        rectangle: { top: 3, bottom: 3, left: 1, right: 1 }
    };
    return seatsMap[shape] || { top: 0, bottom: 0, left: 0, right: 0 };
}

function showMenuContainerScreen() {
    const tablesSectionScreen = document.querySelector('.tables_section');
    const menuContainerScreen = document.querySelector('.menu_container');
    tablesSectionScreen.classList.add('hidden');
    menuContainerScreen.classList.remove('hidden');
    document.getElementById('dashboardSection').style.removeProperty('padding');
}

function parseJSONStringFields(data) {
    const parsedData = { ...data };

    for (const key in parsedData) {
        try {
            if (
                typeof parsedData[key] === 'string' &&
                (parsedData[key].trim().startsWith('[') || parsedData[key].trim().startsWith('{'))
            ) {
                parsedData[key] = JSON.parse(parsedData[key]);
            }
        } catch (error) {
            console.error(`Error parsing ${key}:`, error);
        }
    }

    return parsedData;
}

const setActiveOrderType = async (typeName) => {
    const orderTypes = await storeAPI.get('orderTypes');
    orderTypes.forEach(order => {
        order.isActive = order.category === typeName;
    });
    await storeAPI.set('orderTypes', orderTypes);
    const data = await storeAPI.get('orderTypes');
    showOrderTypes(data);
}

const showOrderTypes = async (orderTypes) => {
    const orderTypeContainer = document.querySelector('.order_type');

    orderTypeContainer.innerHTML = "";

    orderTypes.forEach((item) => {
        orderTypeContainer.innerHTML += `<button class="${item.isActive ? 'active' : ''}" onclick="handleOrderTypeSelection('${item.category}')">${item.name}</button>`;
    })
}

function saveTablePosition(id, left, top) {
    const positions = JSON.parse(localStorage.getItem("tablePositions") || "{}");
    positions[id] = { left, top };
    localStorage.setItem("tablePositions", JSON.stringify(positions));
}

function switchNavigationSection(newLinkId, newSectionId) {
    // Hide the currently opened section and deactivate its link
    const openedLinkId = localStorage.getItem("openedNavigationLink");
    const openedSectionId = localStorage.getItem("openedNavigationSection");

    if (openedLinkId && openedSectionId) {
        const openedLink = document.getElementById(openedLinkId);
        const openedSection = document.getElementById(openedSectionId);

        if (openedLink) openedLink.classList.remove("active");
        if (openedSection) openedSection.classList.add("hidden");
    }

    // Show the new section and activate the new link
    const newLink = document.getElementById(newLinkId);
    const newSection = document.getElementById(newSectionId);

    if (newLink) newLink.classList.add("active");
    if (newSection) newSection.classList.remove("hidden");

    // Update localStorage
    localStorage.setItem("openedNavigationLink", newLinkId);
    localStorage.setItem("openedNavigationSection", newSectionId);
}

function getApplicableAddons(item, addons, categories) {
    const itemMenuId = item.menu_id;
    const itemName = item.name;
    const itemId = item._id;
    const categoryName = item.category_name;

    // Find the category ID from the category name
    const matchedCategory = categories.find(cat => cat.name === categoryName);
    const itemCategoryId = matchedCategory?._id || null;

    const applicableAddons = addons.filter(addon => {
        if (!addon.menu_id) return false; // skip if no menu_id

        const menuMatches = addon.menu_id === itemMenuId;

        if (!menuMatches) return false;

        if (addon.all_items) {
            // Apply if it matches the same menu and is for all items
            return true;
        }

        if (addon.item === itemId) {
            // Apply if addon is for this specific item
            return true;
        }

        if (addon.category_id === itemCategoryId) {
            // Apply if addon matches item's category
            return true;
        }

        return false; // does not match
    });

    return applicableAddons;
}

/**
 * Get current date and time in the specified IANA timezone.
 * @param {string} timeZone - e.g., "Asia/Kolkata" or "America/Winnipeg"
 * @returns {{ day: string, time: string }} - { day: "monday", time: "HH:mm" }
 */
function getCurrentDayTimeInTimezone(timeZone) {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === "weekday").value.toLowerCase();
    const hour = parts.find(p => p.type === "hour").value.padStart(2, "0");
    const minute = parts.find(p => p.type === "minute").value.padStart(2, "0");

    return { day, time: `${hour}:${minute}` };
}

/**
 * Check if offer is currently active based on day/time and timezone.
 * @param {Object} offer - Offer details.
 * @param {string|null} offer.day - "monday", "sunday", "all_week", or null.
 * @param {string} offer.start_time - "HH:mm" or "".
 * @param {string} offer.end_time - "HH:mm" or "".
 * @param {string} timeZone - IANA timezone string.
 * @returns {boolean}
 */
function isOfferActive(offer, timeZone) {
    const { day: offerDay, start_time, end_time } = offer;
    const { day: currentDay, time: currentTime } = getCurrentDayTimeInTimezone(timeZone);

    // Check day match
    if (offerDay && offerDay !== "all_week" && offerDay !== currentDay) {
        return false;
    }

    // Check time range logic
    if (!start_time && !end_time) return true;

    if (start_time && !end_time) {
        return currentTime >= start_time;
    }

    if (!start_time && end_time) {
        return currentTime <= end_time;
    }

    // If both present
    return currentTime >= start_time && currentTime <= end_time;
}

const filterPricingModifiers = async (modifiers, order, timezone) => {
    showLoader();

    const activeModifiers = modifiers.filter(pM => isOfferActive(pM, timezone));

    const orderTypeModifiers = activeModifiers.filter(pM =>
        pM.apply_on_all_order_types || !pM.order_type || pM.order_type?.name?.toLowerCase() === order.orderType?.toLowerCase()
    );

    hideLoader();
    return orderTypeModifiers;
};

function getPriceModifiers(modifiers) {
    return modifiers.map(modifier => {
        let use_for = 'total'; // default fallback

        if (modifier.apply_on_all_items === false && modifier.item && modifier.item._id) {
            use_for = 'item';
        } else if (modifier.apply_on_all_categories === false && modifier.category && modifier.category._id) {
            use_for = 'category';
        } else if (
            modifier.apply_on_all_items === true &&
            (!modifier.category || !modifier.category._id) &&
            (!modifier.item || !modifier.item._id)
        ) {
            use_for = 'item'; // means apply on all items individually
        }

        return {
            ...modifier,
            use_for
        };
    });
}

function attachPriceModifiersToOrder(order, modifierName, modifiers) {
    return {
        ...order,
        [modifierName]: modifiers,
    };
}

async function calculateOrderSummary() {
    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);

    if (!order) return null;

    let subtotal = 0;
    let discountAmount = 0;
    let couponAmount = 0;
    let extraChargeAmount = 0;

    const { items = [], discount, coupon, extra_charge } = order;

    // Subtotal
    items.forEach(item => {
        subtotal += item.total_price || (item.price * item.quantity);
    });

    // Discount
    if (discount) {
        if (discount.use_for === "item") {
            items.forEach(item => {
                const total = item.total_price || (item.price * item.quantity);
                const rate = discount.rate;
                discountAmount += discount.type === "percentage"
                    ? (total * rate) / 100
                    : rate * item.quantity;
            });
        } else if (discount.use_for === "category") {
            items.forEach(item => {
                if (discount.category?._id === item.category_id) {
                    const total = item.total_price || (item.price * item.quantity);
                    const rate = discount.rate;
                    discountAmount += discount.type === "percentage"
                        ? (total * rate) / 100
                        : rate * item.quantity;
                }
            });
        } else if (discount.use_for === "total") {
            const rate = discount.rate;
            discountAmount = discount.type === "percentage"
                ? (subtotal * rate) / 100
                : rate;
        }
    }

    // Coupon
    if (coupon) {
        if (coupon.use_for === "item") {
            items.forEach(item => {
                const total = item.total_price || (item.price * item.quantity);
                const rate = coupon.rate;
                couponAmount += coupon.type === "percentage"
                    ? (total * rate) / 100
                    : rate * item.quantity;
            });
        } else if (coupon.use_for === "category") {
            items.forEach(item => {
                if (coupon.category?._id === item.category_id) {
                    const total = item.total_price || (item.price * item.quantity);
                    const rate = coupon.rate;
                    couponAmount += coupon.type === "percentage"
                        ? (total * rate) / 100
                        : rate * item.quantity;
                }
            });
        } else if (coupon.use_for === "total") {
            const rate = coupon.rate;
            couponAmount = coupon.type === "percentage"
                ? (subtotal * rate) / 100
                : rate;
        }
    }

    // Extra Charges
    if (extra_charge) {
        if (extra_charge.use_for === "item") {
            items.forEach(item => {
                const total = item.total_price || (item.price * item.quantity);
                const rate = extra_charge.rate;
                extraChargeAmount += extra_charge.type === "percentage"
                    ? (total * rate) / 100
                    : rate * item.quantity;
            });
        } else if (extra_charge.use_for === "category") {
            items.forEach(item => {
                if (extra_charge.category?._id === item.category_id) {
                    const total = item.total_price || (item.price * item.quantity);
                    const rate = extra_charge.rate;
                    extraChargeAmount += extra_charge.type === "percentage"
                        ? (total * rate) / 100
                        : rate * item.quantity;
                }
            });
        } else if (extra_charge.use_for === "total") {
            const rate = extra_charge.rate;
            extraChargeAmount = rate;
        }
    }

    const taxableAmount = subtotal - discountAmount - couponAmount + extraChargeAmount;
    const tax = taxableAmount * 0.10;
    const total = taxableAmount + tax;

    const summary = {
        subtotal,
        discount: discountAmount,
        coupon: couponAmount,
        additionalCharges: extraChargeAmount,
        tax,
        total: total < 0 ? 0 : total
    };

    // Update order in DB
    await storeAPI.updateItem('orders', orderId, {
        ...order,
        summary
    });

    return { ...summary, order };
}

async function orderSummaryHandle() {
    const summaryContainer = document.querySelector(".order_summary");
    if (!summaryContainer) return;

    const orderSummary = await calculateOrderSummary();
    console.log(orderSummary);
    if (!orderSummary) return;

    const { subtotal, tax, discount, coupon, additionalCharges, total, order } = orderSummary;

    summaryContainer.innerHTML = `
        <div class="summary_row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary_row">
            <span>Tax (10%):</span>
            <span>₹${tax.toFixed(2)}</span>
        </div>
        ${order.discount ? `
        <div class="summary_row">
            <span>Discount (${order.discount.name || "Discount"}):</span>
            <span>-₹${discount.toFixed(2)}</span>
        </div>` : ''}
        ${order.coupon ? `
        <div class="summary_row">
            <span>Coupon (${order.coupon.name || "Coupon"}):</span>
            <span>-₹${coupon.toFixed(2)}</span>
        </div>` : ''}
        ${order.extra_charge ? `
        <div class="summary_row">
            <span>Extra Charges (${order.extra_charge.name || "Charge"}):</span>
            <span>+₹${additionalCharges.toFixed(2)}</span>
        </div>` : ''}
        <div class="dotted_line"></div>
        <div class="summary_row summary_total">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
    `;

    if (orderSummary.order.orderType === "quick-service") {
        document.querySelector('.menu_offers').classList.remove('hidden');
        if (document.querySelector('.customer_details').classList.toString().includes('hidden')) {
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="resetOrderDetails()">Item</button>
            <button onclick="handlePlaceOrder()">Place Order</button>
        `;
        } else {
            document.querySelector('.menu_bills_btn').innerHTML = `
        <button style="width: 50%;" onclick="handlePayment()">Payment</button>
        `;
        }
    } else if (orderSummary.order.orderType === "pickup") {
        if (document.querySelector('.customer_details').classList.toString().includes('hidden')) {
            document.querySelector('.menu_offers').classList.add('hidden');
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="resetOrderDetails()">Item</button>
            <button onclick="handlePlaceOrder()">Place Order</button>
        `;
        } else if (orderSummary.status = "in-kitchen") {
            document.querySelector('.menu_offers').classList.remove('hidden');
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="" onclick="newOrderCreation()">New</button>
            <button onclick="printBill(false)">Print Bill</button>
            <button onclick="handlePayment(true)">Payment</button>
        `;
        } else {
            document.querySelector('.menu_offers').classList.add('hidden');
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="saveKot(false)">Save Kot</button>
            <button onclick="saveKot(true)">Save & Print Kot</button>
        `;
        }
    }
}

const resetOrderDetails = async () => {
    showLoader();

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);

    order.coupon = null;
    order.discount = null;
    order.extra_charge = null;
    order.items = [];
    order.customer = null;

    await storeAPI.updateItem('orders', order.id, order);

    await orderSummaryHandle();
    showSelectedMenuList();

    hideLoader();
}

const handlePlaceOrder = async () => {
    showLoader();

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);

    const customerDetailForm = document.querySelector('.customer_details_form');

    customerDetailForm.innerHTML = `

    <label for="fullName">Full Name</label>
    <input type="text" name="fullName" id="fullName" placeholder="Enter name" value="${order?.customer?.name || ""}">

    <label for="email">Email</label>
    <input type="email" name="email" id="email" placeholder="Enter email address" value="${order?.customer?.email || ""}">

    <label for="phone">Phone number</label>
    <input type="number" name="phone" id="phone" placeholder="Enter phone number" value="${order?.customer?.phone || ""}">

    <label for="kotNote">Kot note</label>
    <textarea name="kotNote" id="kotNote" placeholder="Write kot note here" rows="5">${order?.customer?.note || ""}</textarea>
`;


    // 👂 Add event listeners to all inputs
    ["fullName", "email", "phone", "kotNote"].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", handleInputChange);
        }
    });


    document.querySelector('.selected_menu').classList.add('hidden');
    document.querySelector('.customer_details').classList.remove('hidden');

    console.log(order);

    if (order.orderType === "quick-service") {
        document.querySelector('.menu_offers').classList.remove('hidden');
        document.querySelector('.menu_bills_btn').innerHTML = `
        <button style="width: 50%;" onclick="handlePayment()">Payment</button>
        `;
    } else if (order.orderType === "pickup") {
        document.querySelector('.menu_offers').classList.add('hidden');
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="saveKot(false)">Save Kot</button>
            <button onclick="saveKot(true)">Save & Print Kot</button>
        `;
    }

    hideLoader();
}

const handleBackToMenuList = async () => {
    document.querySelector('.selected_menu').classList.remove('hidden');
    document.querySelector('.customer_details').classList.add('hidden');
    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    if (activeType === "quick-service") {
        document.querySelector('.menu_offers').classList.remove('hidden');
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="resetOrderDetails()">Item</button>
            <button onclick="handlePlaceOrder()">Place Order</button>
        `;
    } else if (activeType === "pickup") {
        document.querySelector('.menu_offers').classList.add('hidden');
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button onclick="resetOrderDetails()">Item</button>
            <button onclick="handlePlaceOrder()">Place Order</button>
        `;
    }
}

function formatKdsName(kdsId) {
    // Example: "::ffff:192.168.31.14:52216"

    // Remove IPv6-mapped IPv4 prefix "::ffff:"
    let cleaned = kdsId.replace(/^::ffff:/, '');

    // Remove port (after last colon)
    let ipOnly = cleaned.split(':')[0];

    return ipOnly; // "192.168.31.14"
}


const newOrderCreation = async () => {
    showLoader();
    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);
    order.onHold = true; 
    await storeAPI.updateItem('orders', order.id, order);
    toggleOrderType(order.orderType);
    hideLoader();
}