

function onRightAsideVisible() {
    showLoader();
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });

    if (orderDetails.userInfo && orderDetails.orderId && (orderDetails.orderType === openedOrderTypeLink)) {
        const customerInfo = document.querySelector('.customer_info');
        customerInfo.innerHTML = `
            <p style="font-size: 25px; font-weight: 450; color: #19191C;">${orderDetails.userInfo.fullName}</p>
            <p style=" font-size: 15px; color: #19191C; font-weight: 400; border-bottom: 3px solid #F4F4F4; padding-bottom: 10px;">Order ID #<span>${orderDetails.orderId}</span></p>
        `;

        if (openedOrderTypeLink === "quickBill") {
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="width: 50%;" onclick="handleQuickBillPayment()">Payment</button>
            `;
        }
        else {
            document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="" onclick="newOrderCreation()">New</button>
            <button style="" onclick="printBill()">Print Bill</button>
            <button style="" onclick="makePayment()">Payment</button>
            `;
            document.getElementById("dashboardSection").classList.add('disable');
            document.querySelector(".selected_menu").classList.add('disable');
            document.querySelector(".menu_offers").classList.add('disable');
        }
        document.querySelector('.selected_menu').classList.remove('hidden');
        document.querySelector('.customer_details').classList.add('hidden');
        customerInfo.classList.remove('hidden');
    } else {
        document.querySelector('.menu_bills_btn').innerHTML = `
        <button onclick="updateOrderDetails()">Item</button>
        <button onclick="handlePlaceOrder()">Place Order</button>
        `;
        document.querySelector('.selected_menu').classList.remove('hidden');
        document.querySelector('.customer_details').classList.add('hidden');
        document.querySelector('.customer_info').classList.add('hidden');
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
                // orderDetails.selectedMenuList = orderDetails.selectedMenuList.filter(item => {
                //     return !(item.name === dataObj.name &&
                //         JSON.stringify(item.selectedAddons) === JSON.stringify(dataObj.selectedAddons) &&
                //         item.quantity === dataObj.quantity &&
                //         item.totalPrice === dataObj.totalPrice);
                // });
                const index = orderDetails.selectedMenuList.findIndex(item =>
                    item.name === dataObj.name &&
                    JSON.stringify(item.selectedAddons) === JSON.stringify(dataObj.selectedAddons) &&
                    item.quantity === dataObj.quantity &&
                    item.totalPrice === dataObj.totalPrice
                );

                if (index !== -1) {
                    orderDetails.selectedMenuList.splice(index, 1); // Remove only the first matching item
                }

                updateOrderDetails(orderDetails);
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
                updateOrderDetails(orderDetails); // Save changes to localStorage
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
}

function newOrderCreation() {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    // const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
    if (openedOrderTypeLink === "quickBill") {
        localStorage.setItem('quickOrderDetails', JSON.stringify(quickOrderDetails))
        showQuickBillScreen();
    } else if (openedOrderTypeLink === "pickUp") {
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(pickUpOrderDetails))
        showPickupScreen();
    } else {
        localStorage.setItem('dineInOrderDetails', JSON.stringify(dineInOrderDetails));
        showDineIn();
    }
}

function handlePlaceOrder() {
    document.querySelector('.selected_menu').classList.add('hidden');
    document.querySelector('.customer_details').classList.remove('hidden');

    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
    console.log(orderDetails);
    if (orderDetails) {
        const userInfo = orderDetails.userInfo;
        document.getElementById("fullName").value = userInfo?.fullName || "";
        document.getElementById("email").value = userInfo?.email || "";
        document.getElementById("phone").value = userInfo?.phone || "";
        document.getElementById("kotNote").value = userInfo?.kotNote || "";
    }

    if (openedOrderTypeLink === "quickBill") {
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="width: 50%;" onclick="handleQuickBillPayment()">Payment</button>
        `;
    } else {
        document.querySelector('.menu_bills_btn').innerHTML = `
            <button style="" onclick="saveKot()">Save KOT</button>
            <button style="" onclick="saveKot(true)">Save & Print KOT</button>
        `;

    }
}

function handleDineInPlaceOrder() {
    showLoader();
    const orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails"));
    if (orderDetails && orderDetails.tableDetails && orderDetails.tableDetails.length > 0) {
        document.querySelector('.tables_section').classList.add('hidden');
        document.querySelector('.menu_container').classList.remove('hidden');
        document.getElementById('dashboardSection').style.removeProperty('padding');
    } else {
        alert("Select table first!")
    }
    hideLoader();
}

function saveKot(print) {
    const success = handleCustomerDetailsForm();
    if (success) {
        document.querySelector('.selected_menu').classList.remove('hidden');
        document.querySelector('.customer_details').classList.add('hidden');
        document.querySelector('.menu_bills_btn').innerHTML = `
        <button style="" onclick="newOrderCreation()">New</button>
        <button style="" onclick="printBill()">Print Bill</button>
        <button style="" onclick="makePayment()">Payment</button>
        `;

        const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
        const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });

        // save data in localstorage and sent to kot

        saveOrderDetails(orderDetails).then(success => {
            if (success) {
                onRightAsideVisible();
                if (print) {
                    // print it
                }
            } else {
                alert('not ok')
            }
        })

        // const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
        // const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
        // document.getElementById('paymentModel').classList.remove('hidden');
        // document.getElementById('totalBillAmtSpan').innerText = parseFloat(orderDetails.orderSummary.total + orderDetails.paymentDetails.tip).toFixed(2);
    }
}

function printBill() {

}

function makePayment() {
    showLoader();
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
    makePaymentModel(orderDetails.orderSummary, orderDetails.paymentDetails)
    document.getElementById('paymentModel').classList.remove('hidden');
    hideLoader();
}

function makePaymentModel(orderSummary, paymentDetails) {
    console.log(paymentDetails);
    console.log(orderSummary);
    document.getElementById('paymentModel').innerHTML = `
    <div>
            <div class="additional_charges_top">
                <h3 style="font-size: 1.5rem; font-weight: 600;">Choose Payment Mode</h3>
            </div>
            <div style="padding: 2rem;">
                <div class="">
                    <!-- payment types cash/card -->
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 2rem;"
                        id="paymentMethodsContainer">
                        <button data-method="Cash" id="cashPaymentType" class="light-btn active"
                            onclick="choosePaymentMethod('CASH')">
                            <span>Cash</span>
                            <svg width="31" height="20" viewBox="0 0 31 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M29.8975 1.71499C29.7896 1.64765 29.6663 1.60889 29.5392 1.60233C29.4122 1.59577 29.2855 1.62163 29.1712 1.67749C23.7137 4.34249 19.835 3.10124 15.7288 1.78749C11.52 0.441236 7.16875 -0.950014 1.17125 1.97999C1.04498 2.04157 0.938544 2.13737 0.864067 2.25649C0.789591 2.37561 0.750067 2.51325 0.75 2.65374V17.6537C0.750061 17.7809 0.782464 17.906 0.844162 18.0172C0.90586 18.1284 0.994828 18.2221 1.1027 18.2895C1.21057 18.3569 1.3338 18.3957 1.46081 18.4024C1.58782 18.409 1.71444 18.3832 1.82875 18.3275C7.28625 15.6625 11.165 16.9037 15.2712 18.2175C17.6462 18.9787 20.0787 19.755 22.8237 19.755C24.93 19.755 27.225 19.2975 29.8237 18.025C29.95 17.9634 30.0565 17.8676 30.1309 17.7485C30.2054 17.6294 30.2449 17.4917 30.245 17.3512V2.35124C30.2456 2.22446 30.214 2.0996 30.1532 1.98834C30.0925 1.87707 30.0045 1.78302 29.8975 1.71499ZM28.75 16.875C23.5125 19.2762 19.7288 18.0662 15.7288 16.7862C13.3475 16.0225 10.9213 15.25 8.17625 15.25C6.365 15.25 4.41625 15.5875 2.25 16.49V3.12499C7.4875 0.723737 11.2712 1.93374 15.2712 3.21374C19.2225 4.47999 23.3012 5.78499 28.75 3.51374V16.875ZM15.5 6.24999C14.7583 6.24999 14.0333 6.46992 13.4166 6.88197C12.7999 7.29403 12.3193 7.8797 12.0355 8.56492C11.7516 9.25015 11.6774 10.0041 11.8221 10.7316C11.9667 11.459 12.3239 12.1272 12.8483 12.6516C13.3728 13.1761 14.041 13.5332 14.7684 13.6779C15.4958 13.8226 16.2498 13.7484 16.9351 13.4645C17.6203 13.1807 18.206 12.7001 18.618 12.0834C19.0301 11.4667 19.25 10.7417 19.25 9.99999C19.25 9.00542 18.8549 8.0516 18.1517 7.34834C17.4484 6.64507 16.4946 6.24999 15.5 6.24999ZM15.5 12.25C15.055 12.25 14.62 12.118 14.25 11.8708C13.88 11.6236 13.5916 11.2722 13.4213 10.861C13.251 10.4499 13.2064 9.99749 13.2932 9.56103C13.38 9.12458 13.5943 8.72366 13.909 8.409C14.2237 8.09433 14.6246 7.88004 15.061 7.79322C15.4975 7.7064 15.9499 7.75096 16.361 7.92126C16.7722 8.09155 17.1236 8.37994 17.3708 8.74995C17.618 9.11996 17.75 9.55498 17.75 9.99999C17.75 10.5967 17.5129 11.169 17.091 11.591C16.669 12.0129 16.0967 12.25 15.5 12.25ZM6.25 5.99999V12C6.25 12.1989 6.17098 12.3897 6.03033 12.5303C5.88968 12.671 5.69891 12.75 5.5 12.75C5.30109 12.75 5.11032 12.671 4.96967 12.5303C4.82902 12.3897 4.75 12.1989 4.75 12V5.99999C4.75 5.80107 4.82902 5.61031 4.96967 5.46966C5.11032 5.329 5.30109 5.24999 5.5 5.24999C5.69891 5.24999 5.88968 5.329 6.03033 5.46966C6.17098 5.61031 6.25 5.80107 6.25 5.99999ZM24.75 14V7.99999C24.75 7.80107 24.829 7.61031 24.9697 7.46966C25.1103 7.329 25.3011 7.24999 25.5 7.24999C25.6989 7.24999 25.8897 7.329 26.0303 7.46966C26.171 7.61031 26.25 7.80107 26.25 7.99999V14C26.25 14.1989 26.171 14.3897 26.0303 14.5303C25.8897 14.671 25.6989 14.75 25.5 14.75C25.3011 14.75 25.1103 14.671 24.9697 14.5303C24.829 14.3897 24.75 14.1989 24.75 14Z"
                                    fill="url(#paint0_linear_5315_1523)" />
                                <defs>
                                    <linearGradient id="paint0_linear_5315_1523" x1="15.4975" y1="0.25" x2="15.4975"
                                        y2="19.755" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#EFA280" />
                                        <stop offset="1" stop-color="#DF6229" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </button>
                        <button data-method="Card" class="light-btn" id="cardPaymentType"
                            onclick="choosePaymentMethod('CARD')">
                            <span>Card</span>
                            <svg width="29" height="20" viewBox="0 0 29 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M26.5 0.25H2.5C2.03587 0.25 1.59075 0.434375 1.26256 0.762563C0.934375 1.09075 0.75 1.53587 0.75 2V18C0.75 18.4641 0.934375 18.9092 1.26256 19.2374C1.59075 19.5656 2.03587 19.75 2.5 19.75H26.5C26.9641 19.75 27.4092 19.5656 27.7374 19.2374C28.0656 18.9092 28.25 18.4641 28.25 18V2C28.25 1.53587 28.0656 1.09075 27.7374 0.762563C27.4092 0.434375 26.9641 0.25 26.5 0.25ZM2.5 1.75H26.5C26.5663 1.75 26.6299 1.77634 26.6768 1.82322C26.7237 1.87011 26.75 1.9337 26.75 2V5.25H2.25V2C2.25 1.9337 2.27634 1.87011 2.32322 1.82322C2.37011 1.77634 2.4337 1.75 2.5 1.75ZM26.5 18.25H2.5C2.4337 18.25 2.37011 18.2237 2.32322 18.1768C2.27634 18.1299 2.25 18.0663 2.25 18V6.75H26.75V18C26.75 18.0663 26.7237 18.1299 26.6768 18.1768C26.6299 18.2237 26.5663 18.25 26.5 18.25ZM24.25 15C24.25 15.1989 24.171 15.3897 24.0303 15.5303C23.8897 15.671 23.6989 15.75 23.5 15.75H19.5C19.3011 15.75 19.1103 15.671 18.9697 15.5303C18.829 15.3897 18.75 15.1989 18.75 15C18.75 14.8011 18.829 14.6103 18.9697 14.4697C19.1103 14.329 19.3011 14.25 19.5 14.25H23.5C23.6989 14.25 23.8897 14.329 24.0303 14.4697C24.171 14.6103 24.25 14.8011 24.25 15ZM16.25 15C16.25 15.1989 16.171 15.3897 16.0303 15.5303C15.8897 15.671 15.6989 15.75 15.5 15.75H13.5C13.3011 15.75 13.1103 15.671 12.9697 15.5303C12.829 15.3897 12.75 15.1989 12.75 15C12.75 14.8011 12.829 14.6103 12.9697 14.4697C13.1103 14.329 13.3011 14.25 13.5 14.25H15.5C15.6989 14.25 15.8897 14.329 16.0303 14.4697C16.171 14.6103 16.25 14.8011 16.25 15Z"
                                    fill="black" />
                            </svg>
                        </button>
                    </div>
                    <!-- type & reference -->
                    <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 2rem;">
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label for="" style="font-size: 15px;">Tip Amount</label>
                            <input type="text" placeholder="Tip amount"
                                value="${paymentDetails.tip}"
                                style="padding: 10px; font-size: 20px; border-radius: 10px; border: 2px solid #C2C2C2; font-weight: 400;" onkeyup="handleTipAmt(event)">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label for="" style="font-size: 15px;">Payment Refernce No</label>
                            <input type="text" placeholder="Refernce no"
                                style="padding: 10px; font-size: 20px; border-radius: 10px; border: 2px solid #C2C2C2; font-weight: 400; text-transform: uppercase;" onchange="handlePaymentReferenceNumber(event)">
                        </div>
                    </div>
                    <!-- split & due payment -->
                    <div style="display: flex; align-items: center; gap: 30px; margin-bottom: 2rem;">
                        <button
                            style="display: flex;gap: 5px; align-items: center; cursor: pointer; border: none; background-color: transparent;"
                            onclick="splitPayment()">
                            <div class="split_payment_div"
                                style="border: 1px solid #000000;height: 1rem;width: 1rem;border-radius: 50%;color: #000000;display: flex;align-items: center;justify-content: center;padding: 10px;font-size: 10px;">
                            </div>
                            <span for="" style="font-size: 15px;">Split Payment</span>
                        </button>
                        <!-- <div style="display: flex; align-items: center; gap: 5px;">
                            <label for="" style="font-size: 15px;">Add as due payment</label>
                        </div> -->
                    </div>
                    <!-- total & paid & return amts -->
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <p style="font-size: 20px; color: #19191C; font-weight: 600;">
                            Total Amount : <span id="totalBillAmtSpan">${parseFloat(orderSummary.total + paymentDetails.tip).toFixed(2)}</span>
                        </p>
                        <div class="" style="display: flex; flex-direction: column; gap: 5px;">
                            <label for="" style="font-size: 15px;">Customer Paid Amount</label>
                            <input id="paidAmtInput" type="text" placeholder="Paid Amount"
                                style="padding: 10px; font-size: 20px; border-radius: 10px; border: 2px solid #C2C2C2; font-weight: 400;"
                                oninput="calculateReturnAmount(event)">
                        </div>
                        <div class="" style="display: flex; flex-direction: column; gap: 5px;">
                            <span for="" style="font-size: 15px;">Return Amount</span>
                            <div id="returnAmtBox"
                                style="padding: 10px; font-size: 20px; border-radius: 10px; border: 2px solid #C2C2C2; font-weight: 400; color: #C2C2C2; cursor: pointer;">
                                Return Amount
                            </div>
                        </div>
                    </div>
                    <div id="splitPaymentContainer" class="hidden">
                        <div
                            style="margin-top: 2rem; display: flex; gap: 20px; align-items: center; margin-bottom: 2rem;">
                            <input type="number" id="paymentAmount" placeholder="0.00"
                                style="padding: 10px; font-size: 20px; border-radius: 10px; border: 2px solid #C2C2C2;">
                            <button id="addPayment"
                                style="font-size: 20px; color: white; border: none; padding: .8rem 1rem; background: linear-gradient(#EFA280, #DF6229); border-radius: 15px;">Add</button>
                            <p style="font-size: 15px; color: #19191C;">Remaining Amount : <span
                                    id="remainingAmount">0.00</span></p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;" id="paymentSplitMethodsContainer">
                            <button class="light-btn active" style="font-size: 10px; border-radius: 10px;"
                                data-method="Cash">Cash: 0</button>
                            <button class="light-btn active" style="font-size: 10px; border-radius: 10px;"
                                data-method="Card">Card: 0</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 2rem; display: flex; justify-content: center; align-items: center; gap: 20px;">
                    <button class="cancel" onclick="cancelPaymentModel()"
                        style="background: transparent; color: #DF6229; font-size: 1.2rem; border: 2px solid #DF6229; padding: .9rem 1.9rem; border-radius: 30px;">Cancel</button>
                    <button class="apply" onclick="printBill()"
                        style="font-size: 1.2rem; color: white; border: none; padding: 1rem 2rem; background: linear-gradient(#EFA280, #DF6229); border-radius: 30px;">Print
                        Bill</button>
                    <button class="apply" onclick="handleSettleBill()"
                        style="font-size: 1.2rem; color: white; border: none; padding: 1rem 2rem; background: linear-gradient(#EFA280, #DF6229); border-radius: 30px;">Settle
                        Bill</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('paymentModel').classList.remove('hidden');
    if (paymentDetails.card > 0 || paymentDetails.cash > 0) {
        splitPayment();
    }
}

function handleBackToMenuList() {
    showLoader();
    document.querySelector('.selected_menu').classList.remove('hidden');
    document.querySelector('.customer_details').classList.add('hidden');
    document.querySelector('.menu_bills_btn').innerHTML = `
    <button onclick="deleteItems()">Item</button>
    <button onclick="handlePlaceOrder()">Place Order</button>
    `;
    hideLoader();
}

document.getElementById("menuSearch").addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase();
    filterMenuItems(searchQuery);
});

function filterMenuItems(searchQuery) {
    const allMenuItems = document.querySelectorAll(".category_menu_item");

    allMenuItems.forEach((item) => {
        const itemData = JSON.parse(item.getAttribute("data-item"));
        const itemName = itemData.name.toLowerCase();

        if (itemName.includes(searchQuery)) {
            item.style.display = "flex"; // Show matching item
        } else {
            item.style.display = "none"; // Hide non-matching item
        }
    });
}


function switchToCategory(categoryId) {
    const categoryButtons = document.querySelectorAll(".menu_category_button");

    categoryButtons.forEach((button) => {
        if (button.innerText.toLowerCase() === getCategoryName(categoryId).toLowerCase()) {
            button.click(); // Simulate category button click
        }
    });
}

// Helper function to get category name by ID
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "";
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


function updateOrderDetails(orderDetails) {

    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');

    if (orderDetails && orderDetails.selectedMenuList && orderDetails.selectedMenuList.length > 0) {

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
        document.querySelector(".right_aside").classList.remove("hidden");

        if (openedOrderTypeLink === "quickBill") {
            // console.log(openedOrderTypeLink);
            localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
        } else if (openedOrderTypeLink === "pickUp") {
            // console.log(openedOrderTypeLink);
            localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
        } else {
            // console.log(openedOrderTypeLink);
            localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
        }

    } else {
        document.querySelector(".right_aside").classList.add("hidden");
        const _orderId = generateUniqueOrderID();
        if (openedOrderTypeLink === "quickBill") {
            quickOrderDetails.orderId = _orderId
            localStorage.setItem('quickOrderDetails', JSON.stringify(quickOrderDetails))
        } else if (openedOrderTypeLink === "pickUp") {
            pickUpOrderDetails.orderId = _orderId
            localStorage.setItem('pickUpOrderDetails', JSON.stringify(pickUpOrderDetails))
        } else {
            dineInOrderDetails.orderId = _orderId
            document.getElementById('dineInOrderId').innerText = `Order #${_orderId}`;
            localStorage.setItem('dineInOrderDetails', JSON.stringify(dineInOrderDetails));
            document.querySelector(".tables_section").classList.remove('hidden');
            document.querySelector(".menu_container").classList.add('hidden');
            document.getElementById('dashboardSection').style.padding = 0;
            showSelectedTable();
            createTableElements();
        }
    }

}

// Global function to handle "save" button clicks
function handleSave(event) {
    event.preventDefault();
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    let orderDetails;
    if (openedOrderTypeLink === "quickBill") {
        orderDetails = JSON.parse(localStorage.getItem("quickOrderDetails")) || { selectedMenuList: [] }
    } else if (openedOrderTypeLink === "pickUp") {
        orderDetails = JSON.parse(localStorage.getItem("pickUpOrderDetails")) || { selectedMenuList: [] }
    } else {
        orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails")) || { selectedMenuList: [] }
    }
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

    document.querySelector(".add_on").classList.add("hidden");
    orderDetails.selectedMenuList.push(dataObj);
    updateOrderDetails(orderDetails); // Save changes to localStorage
}

// Handles the selection of a product
async function selectProduct(element) {
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    let orderDetails;
    if (openedOrderTypeLink === "quickBill") {
        orderDetails = JSON.parse(localStorage.getItem("quickOrderDetails")) || { selectedMenuList: [] }
    } else if (openedOrderTypeLink === "pickUp") {
        orderDetails = JSON.parse(localStorage.getItem("pickUpOrderDetails")) || { selectedMenuList: [] }
    } else {
        orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails")) || { selectedMenuList: [] }
    }
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
        document.querySelector('.addon_heading').innerText = dataObj.name;
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
        updateOrderDetails(orderDetails);
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

    document.querySelector(".discount_bottom .apply").replaceWith(document.querySelector(".discount_bottom .apply").cloneNode(true));
    document.querySelector(".discount_bottom .cancel").replaceWith(document.querySelector(".discount_bottom .cancel").cloneNode(true));


    document.querySelector(".discount_bottom .apply").addEventListener("click", (event) => {
        event.preventDefault();
        const selectedDiscount = discounts.find((discount) => discount.selected);

        if (!selectedDiscount) {
            // No discount selected, remove the existing discount
            // localStorage.removeItem("selectedDiscount");
            orderDetails.discount = "";
            // localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Discount removed.");
        } else {
            // Apply the selected discount
            // localStorage.setItem("selectedDiscount", JSON.stringify(selectedDiscount));
            orderDetails.discount = selectedDiscount;
            // localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Selected discount:", selectedDiscount);
        }

        discountModal.classList.add("hidden");
        updateOrderDetails(orderDetails); // Your function to handle selected discount
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

    document.querySelector(".additional_charges_bottom .apply").replaceWith(document.querySelector(".additional_charges_bottom .apply").cloneNode(true));
    document.querySelector(".additional_charges_bottom .cancel").replaceWith(document.querySelector(".additional_charges_bottom .cancel").cloneNode(true));

    // Apply button functionality
    document.querySelector(".additional_charges_bottom .apply").addEventListener("click", (event) => {
        event.preventDefault();
        const selectedCharge = charges.find((data) => data.selected);

        if (!selectedCharge) {
            // localStorage.removeItem("selectedCharges");
            orderDetails.additionCharges = "";
            // localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("No charge selected. Previous charges cleared.");
        } else {
            // localStorage.setItem("selectedCharges", JSON.stringify(selectedCharge));
            orderDetails.additionCharges = selectedCharge;
            // localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
            console.log("Selected charge:", selectedCharge);
        }

        chargesModel.classList.add("hidden");
        updateOrderDetails(orderDetails);
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
            categories: ["Pizza"],
            items: ["Margherita Pizza", "Pepperoni Pizza"],
            day: ["Sunday", "Monday"],
            startTime: "11:00 AM",
            endTime: "03:00 PM",
            startDate: "2024-12-01",
            endDate: "2024-12-31",
        },
        {
            name: "Caesar Salad Special - Pickup",
            order_type: ["pickup", "dinein"],
            fixed: true,
            value: "10", // $10 off
            code: "SALAD10",
            selected: false,
            categories: ["Salads"],
            items: ["Caesar Salad"],
            day: ["Wednesday"],
            startTime: "10:00 AM",
            endTime: "02:00 PM",
            startDate: "2024-12-01",
            endDate: "2024-12-15",
        },
        {
            name: "Quick Bill Drinks Offer",
            order_type: ["quickbill"],
            fixed: false,
            value: "15", // 15% discount
            code: "DRINKS15",
            selected: false,
            categories: ["Drinks"],
            items: ["Coke", "Pepsi", "Lemonade"],
            day: ["Friday", "Saturday"],
            startTime: "05:00 PM",
            endTime: "10:00 PM",
            startDate: "2024-12-01",
            endDate: "2024-12-31",
        },
        {
            name: "All Day Breakfast - All Orders",
            order_type: ["all"],
            fixed: true,
            value: "5", // $5 off
            code: "BREAKFAST5",
            selected: false,
            categories: ["all"],
            items: ["Pancakes", "Omelette", "French Toast"],
            day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            startTime: "07:00 AM",
            endTime: "11:59 PM",
            startDate: "2024-01-01",
            endDate: "2025-12-31",
        },
    ];

    let couponModel = document.getElementById("couponCodeModel");
    const inputElement = document.getElementById("couponCode");

    // Determine the order type from localStorage
    const openedOrderTypeLink = localStorage.getItem("openedOrderTypeLink");
    const orderDetailsTypeName = openedOrderTypeLink === "quickBill"
        ? 'quickOrderDetails'
        : openedOrderTypeLink === "pickUp"
            ? "pickUpOrderDetails"
            : 'dineInOrderDetails';

    let orderDetails = JSON.parse(localStorage.getItem(orderDetailsTypeName));

    // Show coupon modal
    couponModel.classList.remove("hidden");

    if (orderDetails.coupon) {
        inputElement.value = orderDetails.coupon.code;
    }

    const applyButton = document.querySelector(".apply_coupon_bottom .apply");
    const cancelButton = document.querySelector(".apply_coupon_bottom .cancel");

    applyButton.replaceWith(applyButton.cloneNode(true));
    cancelButton.replaceWith(cancelButton.cloneNode(true));

    document.querySelector(".apply_coupon_bottom .apply").addEventListener("click", (event) => {
        event.preventDefault();
        const couponCode = inputElement.value.trim();
        if (!couponCode) {
            alert("Enter a coupon code.");
            return;
        }

        const validCoupon = coupons.find(coupon => coupon.code === couponCode);
        if (!validCoupon) {
            alert("Invalid Code, Codes are case sensitive");
            return;
        }

        if (!isCouponValid(validCoupon, orderDetails)) {
            alert("This coupon is not valid for your order.");
            return;
        }

        // Apply coupon
        orderDetails.coupon = validCoupon;
        localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
        updateOrderDetails(orderDetails);
        couponModel.classList.add("hidden");
    });

    document.querySelector(".apply_coupon_bottom .cancel").addEventListener("click", () => {
        inputElement.value = "";
        couponModel.classList.add("hidden");

        // Remove applied coupon
        orderDetails.coupon = null;
        localStorage.setItem(orderDetailsTypeName, JSON.stringify(orderDetails));
        updateOrderDetails(orderDetails);
    });

}

/**
 * Validate if a coupon can be applied based on order details
 */
function isCouponValid(coupon, orderDetails) {
    const currentTime = new Date();
    const today = currentTime.toLocaleDateString("en-US", { weekday: "long" });
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    console.log("Current Day:", today);
    console.log("Current Time:", `${currentHours}:${currentMinutes}`);

    // 1. Validate Order Type
    if (!coupon.order_type.includes("all") && !coupon.order_type.includes(orderDetails.orderType)) {
        console.log("Invalid Order Type");
        return false;
    }

    // 2. Validate Category or Item Match
    const hasMatchingCategory = coupon.categories.includes("all") ||
        orderDetails.selectedMenuList.some(item =>
            item.categories.some(category => coupon.categories.includes(category))
        );

    const hasMatchingItem = orderDetails.selectedMenuList.some(item => coupon.items.includes(item.name));

    console.log("Category Match:", hasMatchingCategory);
    console.log("Item Match:", hasMatchingItem);

    if (!hasMatchingCategory && !hasMatchingItem) {
        console.log("No matching category or item.");
        return false;
    }

    // 3. Validate Date Range (Fix Timezone Issue)
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    // Normalize to local time (start at 00:00:00, end at 23:59:59)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("Coupon Valid From:", startDate);
    console.log("Coupon Valid Until:", endDate);

    if (currentTime < startDate || currentTime > endDate) {
        console.log("Invalid Date Range");
        return false;
    }

    // 4. Validate Day of the Week
    console.log("Coupon Valid Days:", coupon.day);
    if (!coupon.day.includes(today)) {
        console.log("Invalid Day");
        return false;
    }

    // 5. Validate Time Range (Handling AM/PM)
    function convertTimeTo24Hour(time) {
        const [rawTime, period] = time.split(" ");
        let [hour, minute] = rawTime.split(":").map(Number);

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        return [hour, minute];
    }

    const [startHour, startMinute] = convertTimeTo24Hour(coupon.startTime);
    const [endHour, endMinute] = convertTimeTo24Hour(coupon.endTime);

    console.log("Coupon Time Valid From:", `${startHour}:${startMinute}`);
    console.log("Coupon Time Valid Until:", `${endHour}:${endMinute}`);

    if ((currentHours < startHour || (currentHours === startHour && currentMinutes < startMinute)) ||
        (currentHours > endHour || (currentHours === endHour && currentMinutes > endMinute))) {
        console.log("Invalid Time Range");
        return false;
    }

    console.log("Coupon is valid!");
    return true;
}


function handleCustomerDetailsForm() {
    // const form = document.querySelector(".customer_details_form");
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
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

    if (openedOrderTypeLink === "quickBill") {
        // console.log(openedOrderTypeLink);
        localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
    } else if (openedOrderTypeLink === "pickUp") {
        // console.log(openedOrderTypeLink);
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
    } else {
        // console.log(openedOrderTypeLink);
        localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
    }

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

function validateAmount(amount) {
    return !isNaN(amount) && amount >= 0;
}

function handleQuickBillPayment() {
    showLoader();
    const success = handleCustomerDetailsForm();
    if (success) {
        document.querySelector('.selected_menu').classList.remove('hidden');
        document.querySelector('.customer_details').classList.add('hidden');
        onRightAsideVisible();
        const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
        const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
        document.getElementById('paymentModel').classList.remove('hidden');
        document.getElementById('totalBillAmtSpan').innerText = parseFloat(orderDetails.orderSummary.total + orderDetails.paymentDetails.tip).toFixed(2);
    }
    hideLoader();
}

function cancelPaymentModel() {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] };

    orderDetails.paymentDetails = {
        tip: 0,
        reference: null,
        cash: 0,
        card: 0,
    };

    if (openedOrderTypeLink === "quickBill") {
        localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
    } else if (openedOrderTypeLink === "pickUp") {
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
    } else {
        localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
    }

    document.getElementById('paymentModel').classList.add('hidden');
}

function printBill() {
    alert("printed bill")
}

function handleTipAmt(event) {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] };

    orderDetails.paymentDetails.tip = Number(event.target.value);
    document.getElementById('totalBillAmtSpan').innerText = Number(orderDetails.orderSummary.total + orderDetails.paymentDetails.tip).toFixed(2);
    document.getElementById('paidAmtInput').value = "";

    if (openedOrderTypeLink === "quickBill") {
        localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails));
    } else if (openedOrderTypeLink === "pickUp") {
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails));
    } else {
        localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails));
    }

    // Recalculate and update remaining amount

    if (!document.getElementById('splitPaymentContainer').classList.toString().includes("hidden")) {
        handleSplitPayment();
    }
    calculateReturnAmount();
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
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails = openedOrderTypeLink === "quickBill" ? (JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }) : openedOrderTypeLink === "pickUp" ? (JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }) : (JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] });
    const paidAmountInput = document.getElementById('paidAmtInput');
    const returnAmountBox = document.getElementById('returnAmtBox');

    // Example bill amount (this can be dynamically updated as needed)
    const billAmount = parseFloat(orderDetails.orderSummary.total + orderDetails?.paymentDetails?.tip);

    // Calculate and display the return amount
    const paidAmount = parseFloat(paidAmountInput.value);

    if (!isNaN(paidAmount)) {
        const returnAmount = paidAmount - billAmount;

        // Update the return amount box
        if (returnAmount >= 0) {
            returnAmountBox.textContent = `$${returnAmount.toFixed(2)}`;
            returnAmountBox.style.color = "#000000"; // Set active text color
        } else {
            returnAmountBox.textContent = "Return Amount";
            returnAmountBox.style.color = "#C2C2C2"; // Reset color
        }
    } else {
        returnAmountBox.textContent = "Return Amount";
        returnAmountBox.style.color = "#C2C2C2"; // Reset color
    }

}

function splitPayment() {
    const circle = document.querySelector(".split_payment_div");
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] };
    if (circle.innerHTML == "✔") {
        circle.innerHTML = "";
        orderDetails.paymentDetails.card = 0;
        orderDetails.paymentDetails.cash = 0;
        if (openedOrderTypeLink === "quickBill") {
            localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
        } else if (openedOrderTypeLink === "pickUp") {
            localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
        } else {
            localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
        }
        document.getElementById('splitPaymentContainer').classList.add('hidden');
    } else {
        circle.innerHTML = "✔";
        document.getElementById('splitPaymentContainer').classList.remove('hidden');
        handleSplitPayment();
    }
}

function handleSplitPayment() {
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails')) || { selectedMenuList: [] }
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails')) || { selectedMenuList: [] }
                : JSON.parse(localStorage.getItem('dineInOrderDetails')) || { selectedMenuList: [] };

    let totalAmount = parseFloat(orderDetails.orderSummary.total + orderDetails.paymentDetails.tip);
    let cashAmount = parseFloat(orderDetails.paymentDetails.cash);
    let cardAmount = parseFloat(orderDetails.paymentDetails.card);
    let remainingAmount = totalAmount - (cashAmount + cardAmount);

    const paymentAmountInput = document.getElementById('paymentAmount');
    const addPaymentButton = document.getElementById('addPayment');
    const remainingAmountDisplay = document.getElementById('remainingAmount');
    const paymentMethodsContainer = document.getElementById('paymentMethodsContainer');
    const paymentSplitMethodsContainer = document.getElementById('paymentSplitMethodsContainer');

    // Remove any existing event listener to prevent multiple triggers
    addPaymentButton.replaceWith(addPaymentButton.cloneNode(true));
    const newAddPaymentButton = document.getElementById('addPayment');

    newAddPaymentButton.addEventListener('click', function (event) {
        event.preventDefault();
        const paymentAmount = parseFloat(paymentAmountInput.value) || 0;
        if (paymentAmount > 0 && paymentAmount <= Number(remainingAmount.toFixed(2))) {
            remainingAmount -= paymentAmount;

            // Check if Cash or Card is selected and update respective amounts
            const selectedMethod = Array.from(paymentMethodsContainer.children)
                .find(button => button.classList.contains('active'))
                .dataset.method;

            if (selectedMethod === 'Cash') {
                cashAmount = addAmounts(cashAmount, paymentAmount);
                orderDetails.paymentDetails.cash = cashAmount;
            } else if (selectedMethod === 'Card') {
                cardAmount = addAmounts(cardAmount, paymentAmount);
                orderDetails.paymentDetails.card = cardAmount; // Fixed typo: Was updating `cash` for Card
            }

            updatePaymentMethodDisplay();
            updateDisplay();
        } else {
            paymentAmountInput.value = "";
            alert(`Remaining Amount : ${remainingAmount.toFixed(2)}`);
        }
    });

    function addAmounts(amount1, amount2) {
        return parseFloat((Number(amount1) + Number(amount2)).toFixed(2));
    }

    function updateDisplay() {
        totalAmount = parseFloat(orderDetails.orderSummary.total + orderDetails.paymentDetails.tip); // Recalculate total amount
        remainingAmount = totalAmount - (cashAmount + cardAmount); // Recalculate remaining amount
        remainingAmountDisplay.textContent = remainingAmount.toFixed(2);

        if (openedOrderTypeLink === "quickBill") {
            localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails));
        } else if (openedOrderTypeLink === "pickUp") {
            localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails));
        } else {
            localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails));
        }
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
    updatePaymentMethodDisplay();
    updateDisplay();
}

function handleSettleBill() {
    showLoader();
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails'))
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails'))
                : JSON.parse(localStorage.getItem('dineInOrderDetails'))
    orderDetails.status = 0;
    if (openedOrderTypeLink === "quickBill") {
        localStorage.setItem('quickOrderDetails', JSON.stringify(orderDetails))
    } else if (openedOrderTypeLink === "pickUp") {
        localStorage.setItem('pickUpOrderDetails', JSON.stringify(orderDetails))
    } else {
        localStorage.setItem('dineInOrderDetails', JSON.stringify(orderDetails))
    }

    saveOrderDetails(orderDetails).then(success => {
        if (openedOrderTypeLink === "quickBill") {
            localStorage.setItem('quickOrderDetails', JSON.stringify(quickOrderDetails))
        } else if (openedOrderTypeLink === "pickUp") {
            localStorage.setItem('pickUpOrderDetails', JSON.stringify(pickUpOrderDetails))
        } else {
            localStorage.setItem('dineInOrderDetails', JSON.stringify(dineInOrderDetails))
        }
        document.querySelector(".right_aside").classList.add("hidden");
        document.getElementById('paymentModel').classList.add('hidden');
    });
    hideLoader();
}

function generateUniqueOrderID() {
    const timestamp = Date.now(); // Get current timestamp (milliseconds since Unix epoch)
    const randomNum = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
    const orderID = `ORD-${timestamp}-${randomNum.toString().padStart(4, '0')}`; // Ensure 4-digit padding for random number

    return orderID;
}


function removeSelectedTable(id) {
    showLoader();
    const dineInOrderDetails = JSON.parse(localStorage.getItem('dineInOrderDetails'));
    dineInOrderDetails.tableDetails = dineInOrderDetails.tableDetails.filter(t => {
        const tableElement = document.getElementById(`${t.tableId}`);

        if (tableElement && t.tableId == id) {
            tableElement.classList.remove("selected"); // Remove 'selected' class if ID does not match
        }

        return t.tableId !== id; // Keep elements that don't match the given id
    });
    localStorage.setItem("dineInOrderDetails", JSON.stringify(dineInOrderDetails));
    showSelectedTable();
    hideLoader();
}

function showSelectedTable() {
    // selected_tables_info
    const orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails"));
    const showSelectedTablesDiv = document.querySelector('.selected_tables_info');
    showSelectedTablesDiv.innerHTML = "";
    if (orderDetails && orderDetails.tableDetails && Array.isArray(orderDetails.tableDetails)) {
        orderDetails.tableDetails.map((item) => {
            showSelectedTablesDiv.innerHTML += `
            <div>
                <button onclick="removeSelectedTable('${item.tableId}')">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.08334 2.0835L7.91668 7.91683M7.91668 2.0835L2.08334 7.91683"
                            stroke="white" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </button>
                <span>${item.table}</span>
            </div>
        `;
        })
    }
}

function createTableElements(filteredTables) {
    const areaSet = new Set(JSON.parse(localStorage.getItem("selectedAreas")) || []);
    const filteredAreas = [...areaSet];
    const filteredStatus = document.querySelector(".status_indication_filter_main button.active")?.dataset.type
    const tablesSection = document.querySelector('.dineTable-section');
    const orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails"));

    tablesSection.innerHTML = '';
    let tablesData;
    if (filteredTables) {
        tablesData = filteredTables;
    } else {
        tablesData = tables;
        document.querySelector(".table_search input").value = "";
    }

    const selectedTables = orderDetails?.tableDetails?.map(t => t.tableId) || [];

    const sortedTables = tablesData
        .filter(table => filteredAreas.includes(table.area)) // Filter by area
        .filter(table => filteredStatus === "all" || table.status === filteredStatus); // Filter by status

    // .sort((a, b) => {
    //     const shapeOrder = { rectangle: 1, square: 2, circle: 3 };
    //     return shapeOrder[a.shape] - shapeOrder[b.shape];
    // });

    sortedTables.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.classList.add('dineTable', table.shape, `status-${table.status}`);
        tableDiv.id = table.tableId;

        if (selectedTables.includes(table.tableId)) {
            tableDiv.classList.add('selected');
        }

        const seatsDiv = document.createElement('div');
        seatsDiv.classList.add('seats');

        const topDiv = document.createElement('div');
        const bottomDiv = document.createElement('div');
        const leftDiv = document.createElement('div');
        const rightDiv = document.createElement('div');

        topDiv.classList.add('side', 'top');
        bottomDiv.classList.add('side', 'bottom');
        leftDiv.classList.add('side', 'left');
        rightDiv.classList.add('side', 'right');

        const seats = distributeSeats(table.shape);

        for (let i = 0; i < seats.top; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            topDiv.appendChild(seat);
        }

        for (let i = 0; i < seats.bottom; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            bottomDiv.appendChild(seat);
        }

        for (let i = 0; i < seats.left; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            leftDiv.appendChild(seat);
        }

        for (let i = 0; i < seats.right; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            rightDiv.appendChild(seat);
        }

        seatsDiv.appendChild(topDiv);
        seatsDiv.appendChild(bottomDiv);
        seatsDiv.appendChild(leftDiv);
        seatsDiv.appendChild(rightDiv);

        const tableInfo = document.createElement('div');
        tableInfo.classList.add('table-info');
        tableInfo.innerHTML = `<p>${table.tableNumber}</p><span>Seats:${table.seatingCapacity}</span>`;
        tableDiv.appendChild(tableInfo);

        tableDiv.appendChild(seatsDiv);

        tableDiv.addEventListener('click', () => selectTable(table, tableDiv));

        tablesSection.appendChild(tableDiv);
    });
}

function distributeSeats(shape) {
    let seats = { top: 0, bottom: 0, left: 0, right: 0 };

    switch (shape) {
        case "circle":
            seats = { top: 1, bottom: 1, left: 1, right: 1 };
            break;
        case "square":
            seats = { top: 1, bottom: 1, left: 1, right: 1 };
            break;
        case "rectangle":
            seats = { top: 3, bottom: 3, left: 1, right: 1 };
            break;
        default:
            break;
    }

    return seats;
}

function selectTable(table, tableDiv) {
    const orderDetails = JSON.parse(localStorage.getItem("dineInOrderDetails"));
    if (table.status === 'available') {
        tableDiv.classList.toggle('selected');
        if (tableDiv.classList.toString().includes('selected')) {
            orderDetails.tableDetails.push({
                floor: table.area,
                table: table.tableNumber,
                tableId: table.tableId,
            })
        } else {
            orderDetails.tableDetails = orderDetails.tableDetails.filter(
                t => t.tableId !== table.tableId
            );
        }
        localStorage.setItem("dineInOrderDetails", JSON.stringify(orderDetails));
        showSelectedTable();
    } else {
        if (table.status === 'available_soon') {
            alert(`${table.tableNumber} will available soon.`);
        } else {
            alert(`${table.tableNumber} is not available.`);
        }
    }
}


function toggleAreaSelection(button) {
    let selectedAreas = new Set(JSON.parse(localStorage.getItem("selectedAreas")) || []);
    const area = button.dataset.area;

    if (selectedAreas.has(area)) {
        selectedAreas.delete(area);
        button.classList.remove("active");
    } else {
        selectedAreas.add(area);
        button.classList.add("active");
    }

    // Save updated selection to localStorage
    localStorage.setItem("selectedAreas", JSON.stringify([...selectedAreas]));

    // Call the function with updated selected areas
    createTableElements();
}


function creteAreaSelection() {
    const areaSectionAside = document.querySelector('.table_aside');
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


function userHistoryFound() {
    showLoader();
    const openedOrderTypeLink = localStorage.getItem('openedOrderTypeLink');
    const orderDetails =
        openedOrderTypeLink === "quickBill"
            ? JSON.parse(localStorage.getItem('quickOrderDetails'))
            : openedOrderTypeLink === "pickUp"
                ? JSON.parse(localStorage.getItem('pickUpOrderDetails'))
                : JSON.parse(localStorage.getItem('dineInOrderDetails'))
    const sampleData = {
        "lastVisitedOn": "2025-02-01",
        "mostOrderedItem": "Garlic Naan",
        "userName": "Sahil rao",
        "userEmail": "test@example.com",
        "userPhone": "1234567890",
        "totalOrders": 15,
        "orderHistory": [
            {
                "orderId": "000012346",
                "dateTime": "2025-02-01 12:15:20",
                "amount": 250,
                "orderItems": "Paneer Butter Masala, Garlic Naan 2pc, Sweet Lassi",
                "outlet": "ABC Restaurant",
                "orderType": "dinein"
            },
            {
                "orderId": "000012347",
                "dateTime": "2025-02-01 14:45:10",
                "amount": 150,
                "orderItems": "Veg Burger, French Fries, Cold Coffee",
                "outlet": "Fast Bites",
                "orderType": "quickbill"
            },
            {
                "orderId": "000012348",
                "dateTime": "2025-02-01 18:30:45",
                "amount": 90,
                "orderItems": "Masala Dosa, Filter Coffee",
                "outlet": "South Spices",
                "orderType": "pickup"
            },
            {
                "orderId": "000012349",
                "dateTime": "2025-02-01 20:10:05",
                "amount": 320,
                "orderItems": "Chicken Biryani, Raita, Butter Naan 2pc, Mango Shake",
                "outlet": "Tandoori Nights",
                "orderType": "dinein"
            },
            {
                "orderId": "000012350",
                "dateTime": "2025-02-02 09:00:00",
                "amount": 80,
                "orderItems": "Aloo Paratha 2pc, Masala Chai",
                "outlet": "Desi Dhaba",
                "orderType": "quickbill"
            },
            {
                "orderId": "000012351",
                "dateTime": "2025-02-02 13:20:30",
                "amount": 200,
                "orderItems": "Chole Bhature, Sweet Lassi",
                "outlet": "Pind Punjab",
                "orderType": "pickup"
            },
            {
                "orderId": "000012352",
                "dateTime": "2025-02-02 16:50:10",
                "amount": 175,
                "orderItems": "Veg Pizza, Garlic Bread, Soft Drink",
                "outlet": "Pizza Hub",
                "orderType": "dinein"
            },
            {
                "orderId": "000012353",
                "dateTime": "2025-02-02 19:25:55",
                "amount": 400,
                "orderItems": "Mutton Rogan Josh, Jeera Rice, Butter Naan 2pc",
                "outlet": "Spice Villa",
                "orderType": "quickbill"
            }
        ]
    };
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (email === "test@example.com" || phone === "1234567890") {
        const customerHistoryModel = document.querySelector('.customer_history');
        document.querySelector('.customer_history_user_info').innerText = `${sampleData.userName}, ${sampleData.userEmail ? sampleData.userEmail : sampleData.userPhone}`
        customerHistoryModel.querySelector('.total_orders').innerText = sampleData.totalOrders;
        customerHistoryModel.querySelector('.last_visit').innerText = daysAgo(sampleData.lastVisitedOn);
        customerHistoryModel.querySelector('.mostly_ordered').innerText = sampleData.mostOrderedItem;
        customerHistoryModel.querySelector('.order_history_list').innerHTML = "";
        sampleData.orderHistory.forEach((item, index) => {
            customerHistoryModel.querySelector('.order_history_list').innerHTML += `
                 <tr>
                    <td>${index}</td>
                    <td>${item.orderId}</td>
                    <td>${item.dateTime}</td>
                    <td>$${item.amount}</td>
                    <td>${item.orderItems}</td>
                    <td>${item.outlet}</td>
                    <td>${item.orderType}</td>
                </tr>
            `;
        })

        customerHistoryModel.classList.remove('hidden');
    } else {
        alert('No record found!');
    }

    hideLoader();
}

function daysAgo(dateString) {
    const givenDate = new Date(dateString);
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const diffInMs = currentDate - givenDate;

    // Convert milliseconds to days
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Return formatted string
    return days === 1 ? "1 day ago" : `${days} days ago`;
}


function hideCustomerHistoryModel() {
    const customerHistoryModel = document.querySelector('.customer_history');
    customerHistoryModel.classList.add('hidden');
}

function showGeneralSettings() {
    console.log("Showing General Settings");
    const printerContainer = document.getElementById('printerContainer');
    const kdsContainer = document.getElementById("kdsContainer");
    const generalContainer = document.getElementById("generalContainer");
    kdsContainer.classList.add('hidden');
    generalContainer.classList.remove('hidden');
    printerContainer.classList.add('hidden');
}

function showPrinterSettings() {
    console.log("Showing Printer Settings");
    const printerContainer = document.getElementById('printerContainer');
    const kdsContainer = document.getElementById("kdsContainer");
    const generalContainer = document.getElementById("generalContainer");
    kdsContainer.classList.add('hidden');
    generalContainer.classList.add('hidden');
    printerContainer.classList.remove('hidden');
    showPrinter();
}

document.getElementById("ongoingOrderSearch").addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase();
    filterOrders({ target: document.querySelector(".light-btn.active") }, searchQuery);
});

function filterOrders(event, searchQuery = "") {
    const buttons = document.querySelectorAll(".light-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    const filterType = event.target.getAttribute("data-filter");
    displayOrders(filterType, searchQuery);
}

function displayOrders(filter, searchQuery = "") {
    fetchOrders()
        .then((res) => {
            if (!res.success) {
                console.error("Error fetching orders:", res.error);
                return;
            }

            const orders = res.data;
            const ordersContainer = document.getElementById("orders-container");
            ordersContainer.innerHTML = "";

            let filteredOrders = filter === "all" ? orders : orders.filter(order => order.orderType === filter);

            if (searchQuery) {
                console.log(searchQuery.toLowerCase());
                filteredOrders = filteredOrders.filter(order => {
                    try {
                        const userInfo = JSON.parse(order.userInfo);
                        const orderSummary = JSON.parse(order.orderSummary);
                        const tableDetails = JSON.parse(order.tableDetails);
                        
                        // Convert search query to lowercase for case-insensitive search
                        const query = searchQuery.toLowerCase();
                        
                        // Extract relevant search fields
                        const userName = userInfo.fullName.toLowerCase();
                        const orderId = order.id.toString();
                        const tableNames = Array.isArray(tableDetails) 
                            ? tableDetails.map(table => table.table.toLowerCase()).join(", ")
                            : "";
            
                        // Check if any field contains the search query
                        return userName.includes(query) || 
                               orderId.includes(query) || 
                               tableNames.includes(query);
                    } catch (error) {
                        console.error("Error parsing order details:", error);
                        return false;
                    }
                });
            }
            

            filteredOrders.forEach(order => {
                let userInfo, orderSummary, tableDetails;
                try {
                    userInfo = JSON.parse(order.userInfo);
                    orderSummary = JSON.parse(order.orderSummary);
                    tableDetails = JSON.parse(order.tableDetails);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    return;
                }

                let orderTypeText = "Dine In";
                let extraInfo = "";

                if (order.orderType === "pickUp") {
                    orderTypeText = "Pickup";
                    extraInfo = `Pickup ID: ${order.id}`;
                } else if (order.orderType === "quickBill") {
                    orderTypeText = "Quick Bill";
                    extraInfo = `Bill No: ${order.id}`;
                } else if (order.orderType === "dineIn") {
                    orderTypeText = "Dine In";
                    if (Array.isArray(tableDetails) && tableDetails.length > 0) {
                        const tableNumbers = tableDetails.map(table => table.table).join(", ");
                        extraInfo = `Table No(s): ${tableNumbers}`;
                    } else {
                        extraInfo = "Table Info Unavailable";
                    }
                }

                const orderCard = document.createElement("div");
                orderCard.style = "background-color: white; padding: 1rem; display: flex; gap: 4rem; border: 1px solid #ccc; border-radius: 8px;";
                
                orderCard.innerHTML = `
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 18px; color: #2B2B2B; font-weight: 500; margin-bottom: .5rem;">${extraInfo}</span>
                        <span style="color: #2B2B2B; font-size: 14px; margin-bottom: 2rem;">Name: ${userInfo.fullName}</span>
                        <button style="font-size: 14px; color: white; border: none; padding: 5px; background: linear-gradient(#EFA280, #DF6229); border-radius: 20px;">Pay</button>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: end;">
                        <span style="font-size: 18px; color: #2B2B2B; font-weight: 500; margin-bottom: .5rem;">#${order.id}</span>
                        <span style="color: #2B2B2B; font-size: 14px; margin-bottom: 2rem;">$ ${orderSummary?.subtotal}</span>
                        <span style="font-size: 14px; color: #DF6229; margin-top: 5px;">${orderTypeText}</span>
                    </div>
                `;
                ordersContainer.appendChild(orderCard);
            });
        })
        .catch(err => {
            console.error("Network or server error:", err);
        });
}
