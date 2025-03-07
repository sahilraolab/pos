document.addEventListener("DOMContentLoaded", function () {

  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const nameInput = document.getElementById("fullName");
  const actionButton = document.querySelector(".userHistoryInfo"); // Update with actual class

  // Disable button initially
  actionButton.disabled = true;

  // Mock POS records (Replace with actual API call or database lookup)
  const posRecords = [
    { email: "user@example.com", phone: "1234567890", fullName: "John Doe" },
    { email: "test@example.com", phone: "9876543210", fullName: "Jane Smith" }
  ];

  let userModified = false; // Flag to track user edits

  function checkRecordAndAutofill(inputType) {
    if (userModified) return; // Skip autofill if user has modified input

    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    const foundRecord = posRecords.find(record =>
      (inputType === "email" && record.email === email) ||
      (inputType === "phone" && record.phone === phone)
    );

    if (foundRecord) {
      nameInput.value = foundRecord.fullName;
      emailInput.value = foundRecord.email;
      phoneInput.value = foundRecord.phone;
      actionButton.disabled = false; // Enable button if a record is found
      userModified = false;
    } else {
      actionButton.disabled = true; // Keep button disabled if no record found
    }
  }

  // Listen for input events, so changes happen in real-time
  emailInput.addEventListener("input", () => checkRecordAndAutofill("email"));
  phoneInput.addEventListener("input", () => checkRecordAndAutofill("phone"));

  // Button click alert
  actionButton.addEventListener("click", userHistoryFound);


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


function showMainContent() {
  document.querySelector(".screensContainer").classList.remove("hidden");
  document.querySelector(".initialPosSetupLoginScreen").classList.add("hidden");
  document.querySelector(".counterStaffLoginScreen").classList.add("hidden");
}

function showStartDayModel() {
  document.querySelector(".start_day").classList.remove("hidden");
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

function showPosInitialLoginScreen() {
  localStorage.clear();
  document.querySelector(".screensContainer").classList.remove("hidden");
  document.querySelector(".initialPosSetupLoginScreen").classList.remove("hidden");
}

function showSalePersonAuthScreen() {
  document.querySelector(".screensContainer").classList.remove("hidden");
  document.querySelector(".initialPosSetupLoginScreen").classList.add("hidden");
  document.querySelector(".counterStaffLoginScreen").classList.remove("hidden");
}
