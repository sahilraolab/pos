// Fetch menu items using a promise
function fetchMenuItems() {
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: "Margherita",
                    price: 8.99,
                    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
                    status: "enable",
                    categories: ["Pizza"],
                    type: "veg",
                    imageUrl: "https://images.unsplash.com/photo-1625937759429-cb12c50970b4?q=80&w=2887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    addons: [1, 2, 3],
                },
                {
                    id: 2,
                    name: "Pepperoni",
                    price: 9.99,
                    description: "Pizza with tomato sauce, mozzarella, and pepperoni slices.",
                    status: "enable",
                    categories: ["Pizza"],
                    type: "non-veg",
                    imageUrl: "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    addons: [2,3],
                },
                {
                    id: 3,
                    name: "Caesar Salad",
                    price: 7.99,
                    description: "Romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.",
                    status: "enable",
                    categories: ["Salad"],
                    type: "veg",
                    imageUrl: "https://images.unsplash.com/photo-1625937759420-26d7e003e04c?q=80&w=3021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    addons: [4, 5, 6],
                },
                {
                    id: 4,
                    name: "Grilled Chicken Caesar Salad",
                    price: 12.99,
                    description: "Fresh romaine lettuce, grilled chicken, and Caesar dressing.",
                    status: "enable",
                    categories: ["Salad", "Healthy Choices"],
                    type: "non-veg",
                    imageUrl: "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    addons: [4, 5, 6],
                },
                {
                    id: 5,
                    name: "Veggie Pizza",
                    price: 10.99,
                    description: "Delicious pizza with bell peppers, olives, and onions.",
                    status: "enable",
                    categories: ["Pizza", "Vegetarian"],
                    type: "veg",
                    imageUrl: "https://images.unsplash.com/photo-1648679708301-3e2865043526?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    addons: [1, 2],
                },
            ]);
        }, 100);
    });
}

// Fetch addons using a promise
function fetchAddons() {
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            resolve([
                { id: 1, name: "Extra Cheese", price: 1.5, status: "enable", categories: ["Pizza", "Vegetarian"], allItems: true },
                { id: 2, name: "Olives", price: 1.0, status: "enable", categories: ["Pizza", "Salad"], allItems: false },
                { id: 3, name: "Mushrooms", price: 1.0, status: "enable", categories: ["Pizza"], allItems: false },
                { id: 4, name: "Grilled Chicken", price: 2.5, status: "enable", categories: ["Salad", "Pizza"], allItems: false },
                { id: 5, name: "Bacon Bits", price: 1.5, status: "enable", categories: ["Salad", "Pizza"], allItems: false },
                { id: 6, name: "Avocado", price: 1.5, status: "enable", categories: ["Salad"], allItems: false },
            ]);
        }, 100);
    });
}

// Fetch categories using a promise
function fetchCategories() {
    return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
            resolve([
                { id: "Pizza", name: "Pizza", status: "enable", startTime: "04:05 AM", endTime: "04:05 PM" },
                { id: "Salad", name: "Salad", status: "enable", startTime: "06:00 AM", endTime: "06:00 PM" },
                { id: "Sandwich", name: "Sandwich", status: "disable", startTime: "08:00 AM", endTime: "08:00 PM" },
                { id: "Burger", name: "Burger", status: "enable", startTime: "12:00 PM", endTime: "12:00 AM" },
            ]);
        }, 100);
    });
}
