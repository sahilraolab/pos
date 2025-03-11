const db = require("./database");

function setupOrderHandlers(ipcMain) {
    // ===================== FETCH ORDER BY TYPE =====================
    ipcMain.handle("fetch-order-by-type", async (_, orderType) => {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM orders WHERE order_type = ? AND status = 'pending' LIMIT 1",
                [orderType],
                (err, row) => {
                    if (err) {
                        reject({ success: false, error: err.message });
                    } else {
                        resolve(row ? { success: true, id: row.id } : null);
                    }
                }
            );
        });
    });

    // ===================== CREATE NEW ORDER =====================
    ipcMain.handle("create-new-order", async (_, orderData) => {
        const { order_type } = orderData;

        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO orders (order_type, status) VALUES (?, 'pending')", // Ensure status is 'pending'
                [order_type],
                function (err) {
                    if (err) {
                        reject({ success: false, error: err.message });
                    } else {
                        resolve({ success: true, id: this.lastID, order_type });
                    }
                }
            );
        });
    });
}

module.exports = { setupOrderHandlers };
