const db = require('./database');

function setupDatabaseHandlers(ipcMain) {
    ipcMain.handle('save-order', async (event, orderDetails) => {
        const {
            orderId,
            orderType,
            userInfo,
            discount,
            coupon,
            additionCharges,
            selectedMenuList,
            paymentDetails,
            orderSummary,
            tableDetails,
            status = null,
        } = orderDetails;

        return new Promise((resolve, reject) => { // ✅ Ensure return
            db.run(
                `INSERT INTO orders (orderId, orderType, userInfo, discount, coupon, additionCharges, selectedMenuList, paymentDetails, orderSummary, tableDetails, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [
                    orderId,
                    orderType,
                    JSON.stringify(userInfo),
                    JSON.stringify(discount),
                    JSON.stringify(coupon),
                    JSON.stringify(additionCharges),
                    JSON.stringify(selectedMenuList),
                    JSON.stringify(paymentDetails),
                    JSON.stringify(orderSummary),
                    JSON.stringify(tableDetails),
                    status
                ],
                function (err) {
                    if (err) {
                        console.error("Database Error:", err);
                        reject({ success: false, error: err.message });
                    } else {
                        console.log('Order saved with ID:', this.lastID);
                        resolve({ success: true, message: 'Order saved successfully', orderId: this.lastID });
                    }
                }
            );
        });
    });

    ipcMain.handle('fetch-orders', async () => {
        return new Promise((resolve, reject) => { // ✅ Ensure return
            db.all(`SELECT * FROM orders ORDER BY created_at DESC`, (err, rows) => {
                if (err) {
                    console.error("Database Error:", err);
                    reject({ success: false, error: err.message });
                } else {
                    resolve({ success: true, data: rows });
                }
            });
        });
    });
}

module.exports = { setupDatabaseHandlers };
