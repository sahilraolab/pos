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
    kdsSave: 0, // 0 fresh, 1 sent to kds
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
    kdsSave: 0, // 0 fresh, 1 sent to kds
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

document.addEventListener("DOMContentLoaded", async () => {
    const POS_INFO = localStorage.getItem("POS_INFO");

    if (POS_INFO) {
        const WORKING_COUNTER_STAFF = localStorage.getItem("WORKING_COUNTER_STAFF");
        if (WORKING_COUNTER_STAFF) {
            const mainScreensContainer = document.querySelector(".screensContainer");
            if (mainScreensContainer) {

                mainScreensContainer.classList.remove('hidden');
                localStorage.setItem("quickOrderDetails", JSON.stringify(quickOrderDetails));
                localStorage.setItem("pickUpOrderDetails", JSON.stringify(pickUpOrderDetails));
                localStorage.setItem("dineInOrderDetails", JSON.stringify(dineInOrderDetails));
                localStorage.setItem("selectedAreas", JSON.stringify([]));
                showDashboardScreen();

                const DAY_START = localStorage.getItem('DAY_START');
                if (DAY_START) {
                    const punchIn = JSON.parse(WORKING_COUNTER_STAFF)?.activities?.punch_in;
                    if (!punchIn) {
                        showPunchInModel();
                    } else {
                        document.getElementById('currentStaffName').textContent = JSON.parse(WORKING_COUNTER_STAFF).name;
                        document.getElementById('currentStaffRole').textContent = JSON.parse(WORKING_COUNTER_STAFF).role;
                    }
                } else {
                    const startDayModel = document.querySelector('.start_day');
                    startDayModel.classList.remove('hidden');
                }


                /* -------------------------------------
                 Right aside rezide functionality start
                ------------------------------------- */
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

                /* -------------------------------------
                 Right aside rezide functionality end
                ------------------------------------- */

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



                // -------------------------

                const statusButtons = document.querySelectorAll(".status_indication_filter_main button");
                let selectedStatus = "all"; // Default selection

                statusButtons.forEach(button => {
                    button.addEventListener("click", () => {
                        statusButtons.forEach(btn => btn.classList.remove("active"));
                        button.classList.add("active");
                        selectedStatus = button.dataset.type;
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

                // -------------------------
            }
        } else {
            const counterStaffLoginScreen = document.querySelector(".counterStaffLoginScreen");

            if (counterStaffLoginScreen) {
                counterStaffLoginScreen.classList.remove("hidden");

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
                        let _posInfo = JSON.parse(POS_INFO);
                        const requestBody = {
                            brand_id: _posInfo.brand_id,
                            outlet_id: _posInfo.outlet_id,
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

                            console.log("✅ PIN verification successful:", data);
                            localStorage.setItem("WORKING_COUNTER_STAFF", JSON.stringify(data.staff));
                            window.location.reload();
                            // showMainContent();

                            // // Handle Day Start or Punch-in
                            // const dayStart = localStorage.getItem("dayStart");
                            // if (!dayStart) {
                            //     showStartDayModel();
                            // } else {
                            //     showPunchInModel();
                            // }
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
    } else {
        const initialPosSetupLoginScreen = document.querySelector(".initialPosSetupLoginScreen");
        if (initialPosSetupLoginScreen) {
            initialPosSetupLoginScreen.classList.remove("hidden");

            document.getElementById("posForm").addEventListener("submit", async function (event) {
                event.preventDefault();

                showLoader();

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
                        localStorage.setItem("POS_INFO", JSON.stringify(data.data));
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
});


function logout() {
    showLoader();
    localStorage.removeItem("WORKING_COUNTER_STAFF");
    window.location.reload();
}

function submitStartDayModel(event) {
    event.preventDefault();
    showLoader();
    const openingCash = event.target[0].value;
    const openTime = event.target[1].value;
    const comment = event.target[2].value.trim();
    const openBy = JSON.parse(localStorage.getItem('WORKING_COUNTER_STAFF')).user_id;
    const dayStartInfo = {
        openingCash,
        openTime,
        comment,
        openBy
    }
    localStorage.setItem("DAY_START", JSON.stringify(dayStartInfo));
    document.querySelector(".start_day").classList.add("hidden");
    showPunchInModel();
    hideLoader();
}


function showPunchInModel() {
    showLoader();
    const WORKING_COUNTER_STAFF = JSON.parse(localStorage.getItem('WORKING_COUNTER_STAFF'));
    document.getElementById('punchInUserName').textContent = WORKING_COUNTER_STAFF.name + "!";
    document.getElementById('punchInCurrentDate').textContent = getFormattedDate();
    document.querySelector(".punch_in").classList.remove("hidden");
    document.querySelector(".punch_in_btn").addEventListener("click", function () {

        const punchTime = document.getElementById("punchTime").value;

        if (!punchTime) {
            alert("Please select a punch-in time.");
            return;
        }

        const today = new Date();
        const punchInDateTime = new Date(`${today.toISOString().split("T")[0]}T${punchTime}:00Z`).toISOString();

        WORKING_COUNTER_STAFF.activities = WORKING_COUNTER_STAFF.activities || {};
        WORKING_COUNTER_STAFF.activities.punch_in = punchInDateTime;

        if (!WORKING_COUNTER_STAFF.activities.check_ins) {
            WORKING_COUNTER_STAFF.activities.check_ins = [];
        }

        WORKING_COUNTER_STAFF.activities.check_ins.push({
            time: punchInDateTime,
            type: "punch_in"
        });

        // Save back to localStorage
        localStorage.setItem("WORKING_COUNTER_STAFF", JSON.stringify(WORKING_COUNTER_STAFF));

        document.getElementById('currentStaffName').textContent = WORKING_COUNTER_STAFF.name;
        document.getElementById('currentStaffRole').textContent = WORKING_COUNTER_STAFF.role;
        document.querySelector(".punch_in").classList.add("hidden");
    });

    hideLoader();
}

function showOperatorActions() {
    alert('ok')
}


function getFormattedDate() {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "2-digit", weekday: "long" };
    return today.toLocaleDateString("en-US", options);
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