
function startDay() {
    const startDayModel = document.querySelector('.start_day');
    startDayModel.classList.remove('hidden');
}

async function submitStartDayModel(event) {
    event.preventDefault();
    showLoader();

    const form = event.target;
    const openingCash = form.elements["openingCash"]?.value;
    const openTimeRaw = form.elements["openTime"]?.value;
    const comment = form.elements["comment"]?.value.trim();

    const openTime = new Date(openTimeRaw).toISOString().slice(0, 19).replace("T", " ");

    // Validate required fields
    if (!openingCash || !openTime) {
        hideLoader();
        alert("Please fill in all fields before submitting.");
        return;
    }

    try {
        const staffs = await storeAPI.get('staff');
        const matchedStaff = staffs.find(staff => staff.isLoggedIn);
        if (!matchedStaff) {
            hideLoader();
            alert("No users found.");
            return;
        }

        const payload = {
            openingCash,
            openTime,
            comment,
            openBy: matchedStaff.staff_id
        };

        await storeAPI.set('dayStart', payload);

        document.querySelector(".start_day").classList.add("hidden");
        showPunchInModel(matchedStaff);
    } catch (error) {
        alert("An error occurred: " + error.message);
    } finally {
        hideLoader();
    }
}


async function showPunchInModel(staff) {
    showLoader();

    try {
        document.querySelector(".punch_in").classList.remove("hidden");

        document.querySelector(".punch_in_btn").addEventListener("click", async function () {
            const punchTime = document.getElementById("punchTime").value;

            if (!punchTime) {
                alert("Please select a punch-in time.");
                return;
            }


            const today = new Date();
            const punchInDateTime = new Date(`${today.toISOString().split("T")[0]}T${punchTime}:00Z`).toISOString();

            // 📦 Convert
            const dbFormatDateTime = convertToDBTimeFormat(punchInDateTime);
            console.log("Punch In DB Time:", dbFormatDateTime);

            const punchId = generateIdWithTimestamp('punch');

            const payload = {
                user_id: staff.staff_id,
                shift_id: punchId,
                punch_in: dbFormatDateTime,
                status: "Active"
            };

            await storeAPI.set('punchIns', [payload]);
            document.querySelector(".punch_in").classList.add("hidden");
        });

    } catch (error) {
        alert("An error occurred: " + error.message);
    } finally {
        hideLoader();
    }
}


async function handlePriceModifier(modifierType) {
    showLoader();
    const offers = await storeAPI.get('priceModifiers');
    const filteredModifiers = offers.filter(i => i.apply_type === modifierType) || [];

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);

    const orders = await storeAPI.get('orders');
    let filterOrder = orders.find(i => i.id === orderId);

    const POS_INFO = JSON.parse(localStorage.getItem("POS_INFO"));
    const TIMEZONE = POS_INFO?.timezone?.value || "UTC";

    if (!filterOrder || filteredModifiers.length === 0) {
        alert("Nothing found!");
        hideLoader();
        return;
    }

    const discounts = await filterPricingModifiers(filteredModifiers, filterOrder, TIMEZONE);

    const discountModal = document.getElementById("discountModal");
    const discountList = document.getElementById("discountList");

    discountList.innerHTML = ""; // Clear previous discounts

    if (modifierType === "coupon") {
        const appliedCoupon = filterOrder?.coupon;

        const container = document.createElement("div");

        container.innerHTML = `
        <div class="coupon-input-container" style="${appliedCoupon ? "display: none;" : ""}">
            <input type="text" autofocus="true" name="couponCode" id="couponCode" placeholder="Coupon code" />
            <button id="applyCouponBtn">Apply</button>
        </div>
        <div class="coupon-success" style="${appliedCoupon ? "" : "display: none;"}">
            <p>Applied coupon: <strong id="appliedCouponCode">${appliedCoupon?.code || ""}</strong></p>
            <button id="removeCouponBtn">Remove</button>
        </div>
    `;

        const inputContainer = container.querySelector(".coupon-input-container");
        const successContainer = container.querySelector(".coupon-success");
        const input = container.querySelector("#couponCode");
        const applyBtn = container.querySelector("#applyCouponBtn");
        const removeBtn = container.querySelector("#removeCouponBtn");
        const appliedCodeText = container.querySelector("#appliedCouponCode");

        // Handle Apply
        applyBtn.addEventListener("click", async () => {
            const code = input.value.trim();
            console.log(discounts);
            const matched = discounts.find(dis => dis.code?.toLowerCase() === code.toLowerCase());

            if (!matched) {
                alert("Invalid coupon code!");
                return;
            }

            filterOrder = attachPriceModifiersToOrder(filterOrder, "coupon", matched);
            await storeAPI.updateItem('orders', filterOrder.id, filterOrder);
            await orderSummaryHandle();
            // Update UI
            appliedCodeText.textContent = matched.code;
            input.value = "";
            inputContainer.style.display = "none";
            successContainer.style.display = "block";
        });

        // Handle Remove
        removeBtn.addEventListener("click", async () => {
            filterOrder = attachPriceModifiersToOrder(filterOrder, "coupon", null);
            await storeAPI.updateItem('orders', filterOrder.id, filterOrder);
            await orderSummaryHandle();
            // Update UI
            successContainer.style.display = "none";
            inputContainer.style.display = "flex"; // or "block", depending on your layout
        });

        discountList.appendChild(container);
    } else {
        discounts.forEach((discount) => {
            const isSelected = discount._id === filterOrder?.[modifierType]?._id;

            console.log(filterOrder);

            const discountElement = document.createElement("div");
            discountElement.innerHTML = `
        <div class="discount_left ${isSelected ? "selected_section" : ""}">
          <div class="selected">
            <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
          </div>
          <div class="value">
            <span>${discount.name}</span>
            <span>(on ${discount.use_for})</span>
          </div>
        </div>
        <div class="discount_badge">
            <span class="discount_text">${discount.type === "percentage" ? "" : "$"}${discount.rate}${discount.type === "percentage" ? "%" : ""}</span>
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

            discountElement.addEventListener("click", async () => {
                // Update UI to reflect selection
                if (discountElement.querySelector(".discount_left").classList.toString().includes('selected_section')) {
                    // remove the discount
                    console.log("remove");
                    filterOrder = attachPriceModifiersToOrder(filterOrder, modifierType, null);
                    document.querySelectorAll(".discount_left").forEach(el => el.classList.remove("selected_section"));
                    discountElement.querySelector(".discount_left").classList.remove("selected_section");
                } else {
                    //  apply the discount
                    console.log("add");
                    filterOrder = attachPriceModifiersToOrder(filterOrder, modifierType, discount);
                    document.querySelectorAll(".discount_left").forEach(el => el.classList.remove("selected_section"));
                    discountElement.querySelector(".discount_left").classList.add("selected_section");
                }
                await storeAPI.updateItem('orders', filterOrder.id, filterOrder);
                await orderSummaryHandle();

                discountModal.classList.add("hidden");
            });

            discountList.appendChild(discountElement);
        });
    }

    document.querySelector('.hide-model').addEventListener('click', () => {
        discountModal.classList.add("hidden");
    })

    discountModal.classList.remove("hidden");

    hideLoader();
}

async function fetchCustomerOrderHistory() {
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!email && !phone) {
        alert("Please enter customer info (email or phone) to find the order history.");
        return;
    }

    const orders = await storeAPI.get('orders');

    const customerOrders = orders.filter(order => {
        const c = order.customer;
        return c && (c.email === email || c.phone === phone) && order.status !== 'start';
    });

    if (customerOrders.length > 0) {
        console.log("📦 Order history for customer:", customerOrders);
    } else {
        const identity = email || phone;
        console.log(`❌ No order history found for "${identity}" with status other than 'start'.`);
    }
}


let orderData = {};
let paymentTypesList = [];

const handleQuickBillPayment = async () => {
    showLoader();

    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);
    orderData = order;

    const paymentTypes = await storeAPI.get('paymentTypes');
    paymentTypesList = paymentTypes;

    document.getElementById('orderTotal').value = order.summary.total;
    document.getElementById('grandTotal').textContent = order.summary.total.toFixed(2);

    populatePaymentOptions();
    document.getElementById('paymentModel').classList.remove('hidden');

    hideLoader();
};

function populatePaymentOptions() {
    const selects = document.querySelectorAll('.payment-type');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `<option value="">Select Type</option>`;
        paymentTypesList.forEach(pt => {
            const option = document.createElement('option');
            option.value = pt._id;
            option.textContent = pt.name;
            select.appendChild(option);
        });
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

function addSplitRow() {
    const row = document.createElement('div');
    row.className = 'split-row';
    row.style = 'display:flex;gap:10px;margin-top:10px;align-items:center;';
    row.innerHTML = `
        <select class="payment-type" onchange="calculateTotals()">
            <option value="">Select Type</option>
            ${paymentTypesList.map(pt => `<option value="${pt._id}">${pt.name}</option>`).join('')}
        </select>
        <input type="number" class="payment-amount" placeholder="Amount" oninput="calculateTotals()" />
        <button onclick="removeSplitRow(this)" style="background:red;color:white;border:none;padding:4px 8px;border-radius:5px;">&times;</button>
    `;
    document.getElementById('splitGroup').appendChild(row);
}

function removeSplitRow(btn) {
    const row = btn.closest('.split-row');
    row.remove();
    calculateTotals(); // Recalculate totals after removal
}

function calculateTotals() {
    const orderTotal = parseFloat(document.getElementById('orderTotal').value) || 0;
    const tip = parseFloat(document.getElementById('tip').value) || 0;
    const grandTotal = orderTotal + tip;

    let totalPaid = 0;
    document.querySelectorAll('.payment-amount').forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) totalPaid += val;
    });

    const remaining = grandTotal - totalPaid;
    const returnAmt = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
    document.getElementById('totalPaid').textContent = totalPaid.toFixed(2);
    document.getElementById('remaining').textContent = remaining > 0 ? remaining.toFixed(2) : '0.00';
    document.getElementById('return').textContent = returnAmt > 0 ? returnAmt.toFixed(2) : '0.00';
}

async function submitSplitPayment() {
    const orderTotal = parseFloat(document.getElementById('orderTotal').value) || 0;
    const tip = parseFloat(document.getElementById('tip').value) || 0;
    const grandTotal = orderTotal + tip;
    const reference = document.getElementById('reference').value;

    const payments = [];
    let totalPaid = 0;

    const rows = document.querySelectorAll('.split-row');
    for (const row of rows) {
        const typeId = row.querySelector('.payment-type').value;
        const amount = parseFloat(row.querySelector('.payment-amount').value);

        if (!typeId || isNaN(amount) || amount <= 0) {
            alert("All split payments must have valid type and amount.");
            return;
        }

        const paymentTypeName = paymentTypesList.find(p => p._id === typeId)?.name || "Unknown";

        payments.push({ typeId, typeName: paymentTypeName, amount });
        totalPaid += amount;
    }

    const remaining = grandTotal - totalPaid;
    const returnAmt = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

    const result = {
        orderInfo: orderData,

    };

    const paymentInfo = {
        orderTotal,
        tip,
        grandTotal,
        totalPaid,
        remaining: remaining > 0 ? remaining : 0,
        return: returnAmt > 0 ? returnAmt : 0,
        reference,
        payments
    }

    if (paymentInfo.remaining === 0) {
        orderData.paymentInfo = paymentInfo;
        orderData.status = "settle";
        console.log("Settled Order: ", orderData);
        await storeAPI.updateItem('orders', orderData.id, orderData);
        document.getElementById('paymentModel').classList.add('hidden');
        toggleOrderType('quick-service');
    } else {
        return;
    }

}

async function printBill() {
    showLoader();
    const orderTypes = await storeAPI.get('orderTypes');
    const activeType = orderTypes.find(i => i.isActive)?.category;
    const orderId = localStorage.getItem(activeType);
    const orders = await storeAPI.get('orders');
    const order = orders.find(i => i.id === orderId);

    console.log(order);

    alert("🖨️ Printing bill...");
    hideLoader();
}