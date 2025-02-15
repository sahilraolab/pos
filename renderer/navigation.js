const quickOrderDetails = {
    orderId: "",
    userInfo: null,
    orderType: "quickBill",
    discount: "",
    coupon: "",
    additionCharges: "",
    orderSummary: "",
    selectedMenuList: [],
    paymentDetails: {
        tip: 0,
        reference: null,
        cash: 0,
        card: 0,
    },
    tableDetails: [],
    status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
}
const pickUpOrderDetails = {
    orderId: "",
    orderType: "pickUp",
    userInfo: null,
    discount: "",
    coupon: "",
    additionCharges: "",
    orderSummary: "",
    selectedMenuList: [],
    paymentDetails: {
        tip: 0,
        reference: null,
        cash: 0,
        card: 0,
    },
    tableDetails: [],
    status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
}

const dineInOrderDetails = {
    orderId: "",
    orderType: "dineIn",
    userInfo: null,
    discount: "",
    coupon: "",
    additionCharges: "",
    orderSummary: "",
    selectedMenuList: [],
    tableDetails: [],
    paymentDetails: {
        tip: 0,
        reference: null,
        cash: 0,
        card: 0,
    },
    status: null, // fulfilled -> 0, canceled -> 1, refunded -> 2
}

const tables = [
    { tableId: "TBL-001", area: "Ground Floor", tableNumber: "G-1", seatingCapacity: 2, shape: "circle", status: "available" },
    { tableId: "TBL-002", area: "Ground Floor", tableNumber: "G-2", seatingCapacity: 5, shape: "circle", status: "reserved" },
    { tableId: "TBL-003", area: "First Floor", tableNumber: "F-1", seatingCapacity: 6, shape: "square", status: "available_soon" },
    { tableId: "TBL-004", area: "Rooftop", tableNumber: "R-1", seatingCapacity: 20, shape: "rectangle", status: "available_soon" },
    { tableId: "TBL-005", area: "Ground Floor", tableNumber: "G-3", seatingCapacity: 4, shape: "square", status: "available" },
    { tableId: "TBL-006", area: "First Floor", tableNumber: "F-2", seatingCapacity: 3, shape: "circle", status: "reserved" },
    { tableId: "TBL-007", area: "Rooftop", tableNumber: "R-2", seatingCapacity: 6, shape: "rectangle", status: "available" },
    { tableId: "TBL-008", area: "Ground Floor", tableNumber: "G-4", seatingCapacity: 4, shape: "rectangle", status: "available_soon" },
    { tableId: "TBL-009", area: "First Floor", tableNumber: "F-3", seatingCapacity: 5, shape: "circle", status: "available_soon" },
    { tableId: "TBL-010", area: "Rooftop", tableNumber: "R-3", seatingCapacity: 7, shape: "square", status: "available" },
    { tableId: "TBL-011", area: "Ground Floor", tableNumber: "G-5", seatingCapacity: 2, shape: "circle", status: "available_soon" },
    { tableId: "TBL-012", area: "First Floor", tableNumber: "F-4", seatingCapacity: 4, shape: "square", status: "reserved" },
    { tableId: "TBL-013", area: "Rooftop", tableNumber: "R-4", seatingCapacity: 6, shape: "circle", status: "available_soon" },
    { tableId: "TBL-014", area: "Ground Floor", tableNumber: "G-6", seatingCapacity: 3, shape: "rectangle", status: "available" },
    { tableId: "TBL-015", area: "First Floor", tableNumber: "F-5", seatingCapacity: 8, shape: "rectangle", status: "available_soon" },
    { tableId: "TBL-016", area: "Rooftop", tableNumber: "R-5", seatingCapacity: 2, shape: "square", status: "reserved" },
    { tableId: "TBL-017", area: "Ground Floor", tableNumber: "G-7", seatingCapacity: 7, shape: "circle", status: "available_soon" },
    { tableId: "TBL-018", area: "First Floor", tableNumber: "F-6", seatingCapacity: 5, shape: "square", status: "available" },
    { tableId: "TBL-019", area: "Rooftop", tableNumber: "R-6", seatingCapacity: 4, shape: "circle", status: "available_soon" },
    { tableId: "TBL-020", area: "Ground Floor", tableNumber: "G-8", seatingCapacity: 6, shape: "rectangle", status: "available" }
];

document.addEventListener("DOMContentLoaded", () => {

    localStorage.setItem("quickOrderDetails", JSON.stringify(quickOrderDetails));
    localStorage.setItem("pickUpOrderDetails", JSON.stringify(pickUpOrderDetails));
    localStorage.setItem("dineInOrderDetails", JSON.stringify(dineInOrderDetails));
    localStorage.setItem("selectedAreas", JSON.stringify([]));

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

    const statusButtons = document.querySelectorAll(".status_indication_filter_main button");
    let selectedStatus = "all"; // Default selection

    // Event listener for status buttons
    statusButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove 'active' class from all buttons
            statusButtons.forEach(btn => btn.classList.remove("active"));
            // Add 'active' class to the clicked button
            button.classList.add("active");
            // Update selected status
            selectedStatus = button.dataset.type; // Corrected this line
            // Call function to update table elements
            createTableElements();
        });
    });

    const searchInput = document.querySelector(".table_search input");

    searchInput.addEventListener("input", function () {
        const searchValue = searchInput.value.toLowerCase();
        filterTables(searchValue);
    });

    function filterTables(searchValue) {
        const filteredTables = tables.filter(table =>
            table.tableId.toLowerCase().includes(searchValue) ||
            table.area.toLowerCase().includes(searchValue) ||
            table.tableNumber.toLowerCase().includes(searchValue) ||
            table.shape.toLowerCase().includes(searchValue) ||
            table.status.toLowerCase().includes(searchValue)
        );
        createTableElements(filteredTables);
    }

});



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
    // fetchKdsScreens();
    hideLoader();
}

function showQuickBillScreen() {
    showLoader();

    document.getElementById("dashboardSection").classList.remove('disable');
    document.querySelector(".selected_menu").classList.remove('disable');
    document.querySelector(".menu_offers").classList.remove('disable');
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
    document.querySelector(".tables_section").classList.add('hidden');
    document.querySelector(".menu_container").classList.remove('hidden');
    document.getElementById('dashboardSection').style.removeProperty('padding');
    const quickOrderDetails = JSON.parse(localStorage.getItem('quickOrderDetails'));
    console.log(quickOrderDetails);
    if (quickOrderDetails && quickOrderDetails.selectedMenuList && quickOrderDetails.selectedMenuList.length > 0) {
        // Data to show on right sidebar
        // document.querySelector(".right_aside").classList.remove("hidden");
        updateOrderDetails(quickOrderDetails);
        // document.querySelector(".selected_menu").classList.remove("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    } else {
        updateOrderDetails();
        // document.querySelector(".right_aside").classList.add("hidden");
        // document.querySelector(".selected_menu").classList.add("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    }
    hideLoader();
}

function showPickupScreen() {
    showLoader();

    document.getElementById("dashboardSection").classList.remove('disable');
    document.querySelector(".selected_menu").classList.remove('disable');
    document.querySelector(".menu_offers").classList.remove('disable');
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
    document.getElementById("pickUp").classList.add("active");
    document.getElementById("dashboardLink").classList.add("active");
    document.getElementById("dashboardSection").classList.remove("hidden");
    localStorage.setItem("openedOrderTypeLink", "pickUp");
    localStorage.setItem("openedNavigationLink", "dashboardLink");
    localStorage.setItem("openedNavigationSection", "dashboardSection");
    const pickUpOrderDetails = JSON.parse(localStorage.getItem('pickUpOrderDetails'));
    document.querySelector(".tables_section").classList.add('hidden');
    document.querySelector(".menu_container").classList.remove('hidden');
    document.getElementById('dashboardSection').style.removeProperty('padding');
    if (pickUpOrderDetails && pickUpOrderDetails.selectedMenuList && pickUpOrderDetails.selectedMenuList.length > 0) {
        // Data to show on right sidebar
        // document.querySelector(".right_aside").classList.remove("hidden");
        updateOrderDetails(pickUpOrderDetails);
        // document.querySelector(".selected_menu").classList.remove("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    } else {
        // document.querySelector(".right_aside").classList.add("hidden");
        updateOrderDetails();
        // document.querySelector(".selected_menu").classList.add("hidden");
        // document.querySelector(".customer_details").classList.add("hidden");
    }
    hideLoader();
}

function showDineIn() {
    showLoader();

    document.getElementById("dashboardSection").classList.remove('disable');
    document.querySelector(".selected_menu").classList.remove('disable');
    document.querySelector(".menu_offers").classList.remove('disable');

    const asideElement = document.querySelector('.table_aside');

    if (asideElement && !asideElement.children.length > 0) {
        creteAreaSelection();
    }

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
    document.getElementById("dineIn").classList.add("active");
    document.getElementById("dashboardLink").classList.add("active");
    document.getElementById("dashboardSection").classList.remove("hidden");
    localStorage.setItem("openedOrderTypeLink", "dineIn");
    localStorage.setItem("openedNavigationLink", "dashboardLink");
    localStorage.setItem("openedNavigationSection", "dashboardSection");

    const dineInOrderDetails = JSON.parse(localStorage.getItem('dineInOrderDetails'));
    if (dineInOrderDetails && dineInOrderDetails.selectedMenuList && dineInOrderDetails.selectedMenuList.length > 0) {
        document.querySelector(".tables_section").classList.add('hidden');
        document.querySelector(".menu_container").classList.remove('hidden');
        updateOrderDetails(dineInOrderDetails);
    } else {
        updateOrderDetails();
    }

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


    hideLoader();
}