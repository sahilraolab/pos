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
            status = null,
            orderDate,
            orderTime
        } = orderDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO orders (orderId, orderType, userInfo, discount, coupon, additionCharges, selectedMenuList, status, orderDate, orderTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderId, orderType, JSON.stringify(userInfo), JSON.stringify(discount), JSON.stringify(coupon), JSON.stringify(additionCharges), JSON.stringify(selectedMenuList), status, orderDate, orderTime],
                function (err) {
                    if (err) {
                        console.error('Failed to save order:', err.message);
                        resolve({ success: false, error: 'Failed to save order' });
                    } else {
                        console.log('Order saved with ID:', this.lastID);
                        resolve({ success: true, message: 'Order saved successfully', orderId: this.lastID });
                    }
                }
            );
        });
    });

    ipcMain.handle('fetch-orders', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM orders ORDER BY created_at DESC`, (err, rows) => {
                if (err) {
                    console.error('Failed to fetch orders:', err.message);
                    resolve({ success: false, error: 'Failed to fetch orders' });
                } else {
                    resolve({ success: true, data: rows });
                }
            });
        });
    });
}

module.exports = { setupDatabaseHandlers };
