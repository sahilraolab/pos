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

function updateCounterTypo(user) {
    document.querySelectorAll('.counter_user_name').forEach((item) => {
        item.textContent = user.name + "!";
    })
    document.querySelector('.counter_user_role').textContent = user.role;
}

function getFormattedDate() {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "2-digit", weekday: "long" };
    return today.toLocaleDateString("en-US", options);
}


function convertToDBTimeFromat(value) {
    return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}

async function getOrderIdByType(orderType) {
    try {
        const existingOrder = await window.api.invoke('fetch-order-by-type', orderType);
        console.log("Existing Order:", existingOrder);

        if (existingOrder && existingOrder.id) {
            return existingOrder.id;  // Use existing order ID
        } else {
            const newOrder = await window.api.invoke('create-new-order', { order_type: orderType });
            console.log("New Order Created:", newOrder);
            return newOrder.id;  // Return newly created order ID
        }
    } catch (error) {
        console.error("Error in getOrderIdByType:", error);
        return null;
    }
}

function toggleOrderType() {
    const dashboardSection = document.getElementById("dashboardSection");
    const dashboardLink = document.getElementById("dashboardLink");
    const orderTypeBtn = document.getElementById(ORDERTYPE);
    const selected_menu = document.querySelector(".selected_menu");
    const menu_offers = document.querySelector(".menu_offers");

    // Ensure elements exist before modifying classList
    if (dashboardSection) dashboardSection.classList.remove('disable');
    if (selected_menu) selected_menu.classList.remove('disable');
    if (menu_offers) menu_offers.classList.remove('disable');

    // Remove the existing active class from quick links and sidebar links
    document.querySelectorAll('.order_type button').forEach((item) => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.left_aside button').forEach((item) => {
        item.classList.remove('active');
    });

    // Show the dashboard section, enable order type link & dashboard sidebar link
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    if (dashboardLink) dashboardLink.classList.add('active');
    if (orderTypeBtn) orderTypeBtn.classList.add('active');
}

function adjectTableTop() {
    const tableTop = document.querySelector('.table_top');
    if (tableTop) {
        const tableTopHeight = tableTop.getBoundingClientRect().height;
        if (tableTopHeight) {
            // document.querySelector('.table_aside').style.top = tableTopHeight + "px";
            document.querySelector('.table_aside').style.bottom = tableTopHeight + "px";
            document.querySelector('.dineTable-section').style.paddingTop = tableTopHeight + "px";
            document.querySelector('.dineTable-section').style.paddingRight = ((document.querySelector('.table_aside').getBoundingClientRect().width - 1) + 20) + "px";
            document.getElementById('dashboardSection').style.padding = 0;
        }
    }
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