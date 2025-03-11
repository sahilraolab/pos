
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
        const usersInfo = await userAPI.fetchUsers();
        if (!usersInfo?.data?.length) {
            hideLoader();
            alert("No users found.");
            return;
        }

        const activeUser = usersInfo.data.find(user => user.status === "Active");
        if (!activeUser) {
            hideLoader();
            alert("No active user found.");
            return;
        }

        const response = await dayStartAPI.createDayStart({
            openingCash,
            openTime,
            comment,
            openBy: activeUser.user_id
        });

        if (response.success) {
            document.querySelector(".start_day").classList.add("hidden");
            showPunchInModel(activeUser);
        } else {
            alert("Failed to start the day: " + response.error);
        }
    } catch (error) {
        alert("An error occurred: " + error.message);
    } finally {
        hideLoader();
    }
}


async function showPunchInModel(currentUser) {
    showLoader();
    let user = currentUser;

    try {
        if (!user) {
            const response = await userAPI.fetchUsers();
            if (!response.success || !response.data.length) {
                hideLoader();
                alert("No users found.");
                return;
            }

            const activeUser = response.data.find(user => user.status === "Active");
            if (!activeUser) {
                hideLoader();
                alert("No active user found.");
                return;
            }

            user = activeUser;
        }

        document.querySelector(".punch_in").classList.remove("hidden");

        document.querySelector(".punch_in_btn").addEventListener("click", async function () {
            const punchTime = document.getElementById("punchTime").value;

            if (!punchTime) {
                alert("Please select a punch-in time.");
                return;
            }

            const today = new Date();
            const punchInDateTime = new Date(`${today.toISOString().split("T")[0]}T${punchTime}:00Z`).toISOString();
            const dbFormatDateTime = convertToDBTimeFromat(punchInDateTime);

            try {
                const checkInResponse = await shiftAPI.createShift({
                    user_id: user.user_id,
                    shift_id: null,  // Auto-incremented in DB
                    punch_in: dbFormatDateTime,
                    status: "Active"
                });

                if (checkInResponse.success) {
                    document.querySelector(".punch_in").classList.add("hidden");
                } else {
                    alert("Failed to punch in: " + checkInResponse.error);
                }
            } catch (error) {
                alert("An error occurred while punching in: " + error.message);
            }
        });

    } catch (error) {
        alert("An error occurred: " + error.message);
    } finally {
        hideLoader();
    }
}



// const requestBody = {
//     brand_id: POS_INFO.brand_id,
//     outlet_id: POS_INFO.outlet_id
// }

// const response = await fetch("http://localhost:3000/api/menu_offers", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(requestBody),
// });

// const data = await response.json();

// if (!response.ok) {
//     throw new Error(data.message || "Failed to verify PIN. Please check your credentials.");
// }

// const menuOffers = data.data;
// if (menuOffers) {
//     menuOffers.forEach(async (offer) => {
//         await menuOffersAPI.createMenuOffer(offer);
//     });
// }

async function handleMenuOffers(type) {
    showLoader();


    const response = await menuOffersAPI.fetchMenuOffers();
    const offers = response.data;
    const orderId = await getOrderIdByType(ORDERTYPE);

    switch (type) {
        case "DISCOUNT":
            const discounts = offers.filter((item) => item.type.toLowerCase() === type.toLowerCase());
            showDiscounts(discounts, orderId);
            break;
        case "CHARGE":
            const charges = offers.filter((item) => item.type.toLowerCase() === type.toLowerCase());
            console.log(charges);
            break;

        default:
            const coupons = offers.filter((item) => item.type.toLowerCase() === type.toLowerCase());
            console.log(coupons);
            break;
    }

    hideLoader();
}

function showDiscounts(discounts, orderId) {

    console.log(discounts)
    const discountModal = document.getElementById("discountModal");
    const discountList = document.getElementById("discountList");

    discountList.innerHTML = ""; // Clear previous discounts

    discounts.forEach((discount) => {
        const orderIds = JSON.parse(discount.order_id || "[]"); // Parse existing order_ids
        const isSelected = orderIds.includes(orderId);

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
            <span>(on ${JSON.parse(discount.order_type).join(", ")})</span>
          </div>
        </div>
        <div class="discount_badge">
            <span class="discount_text">${discount.fixed ? "$" : ""}${discount.value}${discount.fixed ? "" : "%"}</span>
        </div>
      `;

        discountElement.addEventListener("click", async() => {
            let updatedOrderIds = orderIds.includes(orderId)
                ? orderIds.filter(id => id !== orderId) // Remove orderId if already present
                : [...orderIds, orderId]; // Add orderId if not present

            discount.order_id = updatedOrderIds.length > 0 ? JSON.stringify(updatedOrderIds) : null;

            console.log(discount.id, discount.order_id);

            document.querySelectorAll(".discount_left").forEach(el => el.classList.remove("selected_section"));
            if (updatedOrderIds.includes(orderId)) {
                discountElement.querySelector(".discount_left").classList.add("selected_section");
            }
        });

        discountList.appendChild(discountElement);
    });

    discountModal.classList.remove("hidden");

    // Replacing Apply & Cancel buttons to remove old event listeners
    document.querySelector(".discount_bottom .apply").replaceWith(document.querySelector(".discount_bottom .apply").cloneNode(true));
    document.querySelector(".discount_bottom .cancel").replaceWith(document.querySelector(".discount_bottom .cancel").cloneNode(true));

    // Add event listener for Apply button
    document.querySelector(".discount_bottom .apply").addEventListener("click", async () => {
    //     await menuOffersAPI.updateOrderIds(discountId, updatedOrderIds);
        discountModal.classList.add("hidden");
    });

    // Add event listener for Cancel button
    document.querySelector(".discount_bottom .cancel").addEventListener("click", () => {
        discountModal.classList.add("hidden");
    });
}
