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

        try {
            await new Promise((resolve, reject) => {
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
                            reject(err);
                        } else {
                            console.log('Order saved with ID:', this.lastID);
                            resolve({ success: true, message: 'Order saved successfully', orderId: this.lastID });
                        }
                    }
                );
            });
        } catch (err) {
            console.error('Failed to save order:', err.message);
            return { success: false, error: 'Failed to save order' };
        }
    });

    ipcMain.handle('fetch-orders', async () => {
        try {
            const rows = await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM orders ORDER BY created_at DESC`, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });
            return { success: true, data: rows };
        } catch (err) {
            console.error('Failed to fetch orders:', err.message);
            return { success: false, error: 'Failed to fetch orders' };
        }
    });
}

module.exports = { setupDatabaseHandlers };
