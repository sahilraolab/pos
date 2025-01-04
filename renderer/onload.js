document.addEventListener("DOMContentLoaded", function () {
  // const keys = document.querySelectorAll(".key");
    // pin = "";
    // keys.forEach((key) => {
    //     key.addEventListener("click", () => {
    //         if (key.classList.contains("delete")) {
    //             pin = pin.slice(0, -1);
    //         } else if (pin.length < 4) {
    //             pin += key.textContent.trim();
    //         }
    //         updateDots();

    //         if (pin.length === 4) {
    //             verifyPin(pin);
    //         }
    //     });
    // });
});

function checkInternetConnection() {
  if (navigator.onLine) {
    console.log("Internet is connected");
    return true;
  } else {
    console.log("Internet is not connected");
    return false;
  }
}

// Function to update the localStorage with the selected products and their add-ons
function updateLocalStorage() {
  const menuItems = document.querySelectorAll(".selected_menu .menu_item");
  const products = [];

  menuItems.forEach((menuItem) => {
    const name = menuItem.querySelector(".menu_item_product_name").textContent;
    const basePrice =
      parseFloat(
        menuItem
          .querySelector(".menu_item_product_price")
          .textContent.replace("$", "")
      ) / parseInt(menuItem.querySelector(".menu_numbers").value);
    const quantity = parseInt(menuItem.querySelector(".menu_numbers").value);
    const addonNames = menuItem
      .querySelector(".menu_item_sub_product_names")
      .textContent.split(", ")
      .filter((name) => name !== "");
    const discountElement = menuItem.querySelector(
      ".discount_badge .discount_text"
    );
    const discount = discountElement ? discountElement.textContent : "0%";

    const addons = addonNames.map((name) => {
      const addon = Array.from(document.querySelectorAll(`.addon`)).find(
        (el) => el.querySelector(".name").textContent === name
      );
      return {
        name: addon.querySelector(".name").textContent,
        price: parseFloat(
          addon.querySelector(".price").textContent.replace(/[()$]/g, "")
        ),
      };
    });

    products.push({ name, basePrice, quantity, addons, discount });
  });

  localStorage.setItem("selectedProducts", JSON.stringify(products));
}

// function updateQuickLinks(show, hide1, hide2) {
//   document.getElementById(show).classList.add("active");
//   document.getElementById(hide1).classList.remove("active");
//   document.getElementById(hide2).classList.remove("active");
// }

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    if (index < pin.length) {
      dot.textContent = pin[index];
      dot.classList.add("filled");
    } else {
      dot.textContent = "";
      dot.classList.remove("filled");
    }
  });
}

async function verifyPin(pin) {
  const token = localStorage.getItem("POSAuthenticationToken");
  if (!token) {
    alert("No token found. Please login again.");
    return;
  }

  const requestBody = {
    token: token,
    pin: pin,
  };

  try {
    const response = await fetch("http://localhost:3000/pos-saleperson-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("PIN verification failed");
    }

    const data = await response.json();
    console.log("PIN verification successful:", data);

    showMainContent();
    const dayStart = localStorage.getItem("dayStart");
    if (!dayStart) {
      showStartDayModel();
    } else {
      showPunchInModel();
    }
  } catch (error) {
    console.error("Error during PIN verification:", error);
    alert("PIN verification failed. Please try again.");
    clearDots();
  } finally {
    hideLoader();
  }
}

function showMainContent() {
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.add("hidden");
  document.querySelector(".loginContainer").classList.add("hidden");
}

function showStartDayModel() {
  document.querySelector(".start_day").classList.remove("hidden");
}

function submitStartDayModel(event) {
  event.preventDefault();
  showLoader();
  document.querySelector(".start_day").classList.add("hidden");
  localStorage.setItem("dayStart", true);
  showPunchInModel();
  hideLoader();
}

function showPunchInModel() {
  document.querySelector(".punch_in").classList.remove("hidden");
}

// function sumbitPunchInModle() {
//   showLoader();
//   document.querySelector(".punch_in").classList.add("hidden");
//   document.querySelector(".order_type").classList.remove("hidden");
//   document.querySelector(".content").classList.remove("hidden");
//   updateQuickLinks("quickBill", "dineIn", "Pickup");
//   loadMenu();
//   hideLoader();
// }

function loadMenu() {
  showLoader(true);
  const menu = [
    {
      category: "Pizza",
      items: [
        {
          id: 1,
          name: "Margherita",
          price: 8.99,
          description:
            "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1625937759429-cb12c50970b4?q=80&w=2887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Olives", price: 1.0 },
            { name: "Mushrooms", price: 1.0 },
          ],
        },
        {
          id: 2,
          name: "Pepperoni",
          price: 9.99,
          description:
            "Pizza with tomato sauce, mozzarella, and pepperoni slices.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: null,
        },
        // More items...
      ],
    },
    {
      category: "Salad",
      items: [
        {
          id: 4,
          name: "Caesar Salad",
          price: 7.99,
          description:
            "Romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.",
          available: true,
          group: ["total", "healthy"],
          imageUrl:
            "https://images.unsplash.com/photo-1625937759420-26d7e003e04c?q=80&w=3021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Grilled Chicken", price: 2.5 },
            { name: "Bacon Bits", price: 1.5 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        {
          id: 5,
          name: "Greek Salad",
          price: 8.49,
          description:
            "Mixed greens, tomatoes, cucumbers, red onions, olives, feta cheese, and Greek dressing.",
          available: true,
          group: ["total", "healthy"],
          imageUrl:
            "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Grilled Chicken", price: 2.5 },
            { name: "Bacon Bits", price: 1.5 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        // More items...
      ],
    },
    {
      category: "Sandwich",
      items: [
        {
          id: 7,
          name: "Turkey Club",
          price: 9.49,
          description:
            "Turkey, bacon, lettuce, tomato, and mayo on toasted bread.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1655195672072-0ffaa663dfa4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Bacon", price: 2.0 },
            { name: "Cheese", price: 1.0 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        {
          id: 8,
          name: "BLT",
          price: 7.99,
          description: "Bacon, lettuce, and tomato with mayo on toasted bread.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1625937759420-26d7e003e04c?q=80&w=3021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Bacon", price: 2.0 },
            { name: "Cheese", price: 1.0 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        // More items...
      ],
    },
    {
      category: "Burger",
      items: [
        {
          id: 10,
          name: "Classic Cheeseburger",
          price: 10.99,
          description:
            "Beef patty with cheddar cheese, lettuce, tomato, onions, and pickles on a sesame seed bun.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1625937759429-cb12c50970b4?q=80&w=2887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Bacon", price: 2.0 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        {
          id: 11,
          name: "Bacon Burger",
          price: 12.49,
          description:
            "Beef patty with bacon, cheddar cheese, lettuce, tomato, and BBQ sauce on a sesame seed bun.",
          available: true,
          group: ["total", "fine"],
          imageUrl:
            "https://images.unsplash.com/photo-1655195672072-0ffaa663dfa4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          addons: [
            { name: "Extra Cheese", price: 1.5 },
            { name: "Bacon", price: 2.0 },
            { name: "Avocado", price: 1.5 },
          ],
        },
        // More items...
      ],
    },
  ];

  showMenuCategories(menu);
  hideLoader();
}

function clearDots() {
  pin = "";
  updateDots();
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

async function handlePOSAuthentication(event) {
  event.preventDefault(); // Prevent the form from submitting
  showLoader();

  const posId = document.getElementById("posIdInput")?.value?.trim();
  const password = document.getElementById("passwordInput")?.value?.trim();

  // Validate inputs
  if (!posId || !password) {
    alert("Please enter POS ID and Password");
    hideLoader();
    return;
  }

  const requestBody = {
    clientId: posId,
    password: password,
  };

  try {
    // Send POST request to server
    const response = await fetch("http://localhost:3000/pos-authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Handle response
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Authentication failed: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Authentication successful:", data);
    localStorage.setItem("POSAuthenticationToken", data.token);
    document.querySelector(".container").classList.remove("hidden");
    document.querySelector(".posloginContainer").classList.add("hidden");
    document.querySelector(".loginContainer").classList.remove("hidden");
  } catch (error) {
    console.error("Error during authentication:", error.message);
    alert(`Error: ${error.message}`);
  } finally {
    hideLoader();
  }
}

function showPosInitialLoginScreen() {
  localStorage.clear();
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.remove("hidden");
}

function showSalePersonAuthScreen() {
  document.querySelector(".container").classList.remove("hidden");
  document.querySelector(".posloginContainer").classList.add("hidden");
  document.querySelector(".loginContainer").classList.remove("hidden");
}

// function showAdditionalChargesModel() {
//   const charges = [
//     {
//       name: "Broccoli Staff",
//       type: "subtotal",
//       value: "50",
//       unit: "%",
//       selected: false,
//       categories: [],
//       groups: [],
//     },
//     {
//       name: "Summer Sale",
//       type: "subtotal",
//       value: "20",
//       unit: "%",
//       selected: false,
//       categories: [],
//       groups: [],
//     },
//     {
//       name: "Fly Dubai",
//       type: "category",
//       value: "5",
//       unit: "$",
//       selected: false,
//       categories: ["fine"],
//       groups: [],
//     },
//     {
//       name: "Better homes",
//       type: "subtotal",
//       value: "10",
//       unit: "%",
//       selected: false,
//       categories: [],
//       groups: [],
//     },
//     {
//       name: "Group Charge",
//       type: "group",
//       value: "15",
//       unit: "%",
//       selected: false,
//       categories: ["fruits"],
//       groups: ["citrus"],
//     },
//   ];

//   const chargesModel = document.getElementById("chargeModel");
//   const chargesList = document.getElementById("chargeList");

//   chargesList.innerHTML = ""; // Clear previous charges

//   charges.forEach((data, index) => {
//     const chargeElement = document.createElement("div");
//     chargeElement.innerHTML = `
//         <div class="additional_charges_left ${
//           data.selected ? "selected_section" : ""
//         }">
//           <div class="selected">
//             <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
//               <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
//             </svg>
//           </div>
//           <div class="value">
//             <span>${data.name}</span>
//             <span>(on ${data.type})</span>
//           </div>
//         </div>
//         <div class="additional_charges_badge">
//           <span class="discount_text">${data.value}${data.unit}</span>
//         </div>
//       `;

//     chargeElement.addEventListener("click", (event) => {
//       charges.forEach((d, i) => {
//         if (i !== index) {
//           d.selected = false;
//           const otherElement = chargesList.children[i].querySelector(
//             ".additional_charges_left"
//           );
//           if (otherElement) {
//             otherElement.classList.remove("selected_section");
//           }
//         }
//       });

//       data.selected = !data.selected;
//       event.currentTarget
//         .querySelector(".additional_charges_left")
//         .classList.toggle("selected_section", data.selected);
//     });

//     chargesList.appendChild(chargeElement);
//   });

//   chargesModel.classList.remove("hidden");

//   document
//     .querySelector(".additional_charges_bottom .apply")
//     .addEventListener("click", () => {
//       const selectedCharge = charges.find((data) => data.selected);
//       console.log("Selected charge:", selectedCharge);
//       chargesModel.classList.add("hidden");
//       // Apply the selected charge to the order (update order summary, localStorage, etc.)
//       localStorage.setItem("selectedCharges", JSON.stringify(selectedCharge));
//       updateOrderSummary(null, selectedCharge);
//     });

//   document
//     .querySelector(".additional_charges_bottom .cancel")
//     .addEventListener("click", () => {
//       charges.forEach((data) => (data.selected = false));
//       chargesModel.classList.add("hidden");
//     });
// }

// function updateOrderSummary(
//   selectedDiscountObj = null,
//   selectedChargesObj = null
// ) {
//   const products = JSON.parse(localStorage.getItem("selectedProducts")) || [];
//   const selectedDiscount =
//     selectedDiscountObj ||
//     JSON.parse(localStorage.getItem("selectedDiscount")) ||
//     null;
//   const selectedCharge =
//     selectedChargesObj ||
//     JSON.parse(localStorage.getItem("selectedCharges")) ||
//     null;
//   let subtotal = 0;
//   let discount = 0;
//   let charge = 0;

//   // Calculate the subtotal
//   products.forEach((product) => {
//     subtotal += product.basePrice * product.quantity;
//   });

//   // Apply discount
//   if (selectedDiscount && selectedDiscount.groups) {
//     if (selectedDiscount.groups.includes("total")) {
//       if (selectedDiscount.unit === "%") {
//         discount = (subtotal * selectedDiscount.value) / 100;
//       } else if (selectedDiscount.unit === "$") {
//         discount = selectedDiscount.value;
//       }
//     } else {
//       products.forEach((product) => {
//         if (selectedDiscount.groups.includes(product.group)) {
//           if (selectedDiscount.unit === "%") {
//             discount +=
//               (product.basePrice * selectedDiscount.value * product.quantity) /
//               100;
//           } else if (selectedDiscount.unit === "$") {
//             discount += selectedDiscount.value * product.quantity;
//           }
//         }
//       });
//     }
//   }

//   // Apply charge
//   if (selectedCharge && selectedCharge.groups) {
//     if (selectedCharge.groups.includes("total")) {
//       if (selectedCharge.unit === "%") {
//         charge = (subtotal * selectedCharge.value) / 100;
//       } else if (selectedCharge.unit === "$") {
//         charge = selectedCharge.value;
//       }
//     } else {
//       products.forEach((product) => {
//         if (selectedCharge.groups.includes(product.group)) {
//           if (selectedCharge.unit === "%") {
//             charge +=
//               (product.basePrice * selectedCharge.value * product.quantity) /
//               100;
//           } else if (selectedCharge.unit === "$") {
//             charge += selectedCharge.value * product.quantity;
//           }
//         }
//       });
//     }
//   }

//   // Calculate tax and total
//   const taxRate = 0.13; // Example tax rate
//   const tax = (subtotal - discount + charge) * taxRate;
//   const total = subtotal - discount + charge + tax;

//   // Update UI
//   document.getElementById("subTotalNumber").innerText = `$${subtotal.toFixed(
//     2
//   )}`;
//   if (discount > 0) {
//     document.getElementById("discountBox").classList.remove("hidden");
//     document.getElementById("discounNumber").innerText = `$${discount.toFixed(
//       2
//     )}`;
//   }
//   if (charge > 0) {
//     document.getElementById("additionChargeBox").classList.remove("hidden");
//     document.getElementById(
//       "additionChargeNumber"
//     ).innerText = `$${charge.toFixed(2)}`;
//   }
//   document.getElementById("taxNumber").innerText = `$${tax.toFixed(2)}`;
//   document.getElementById("totalNumber").innerText = `$${total.toFixed(2)}`;
// }
