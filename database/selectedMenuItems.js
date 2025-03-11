const db = require('./database');

function setupSelectedMenuItemsHandlers(ipcMain) {
    // ===================== CREATE SELECTED MENU ITEM =====================
    ipcMain.handle('create-selected-menu-item', async (event, menuItemDetails) => {
        const { order_id, name, price, description, status, categories, type, order_type, addons, activeAddons, quantity, total_price } = menuItemDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO selected_menu_items (order_id, name, price, description, status, categories, type, order_type, addons, activeAddons, quantity, total_price, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [order_id, name, price, description, status, JSON.stringify(categories), type, order_type, JSON.stringify(addons), JSON.stringify(activeAddons), quantity, total_price],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, menuItemId: this.lastID, message: 'Menu Item Created' });
                }
            );
        });
    });

    // ===================== FETCH SELECTED MENU ITEMS (BY ORDER ID) =====================
    ipcMain.handle('fetch-selected-menu-items', async (event, order_id) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM selected_menu_items WHERE order_id = ? ORDER BY created_at DESC`, [order_id], (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    // ===================== FETCH ALL SELECTED MENU ITEMS =====================
    ipcMain.handle('fetch-all-selected-menu-items', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM selected_menu_items ORDER BY created_at DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    // ===================== UPDATE SELECTED MENU ITEM =====================
    ipcMain.handle('update-selected-menu-item', async (event, menuItemDetails) => {
        const { id, order_id, name, price, description, status, categories, type, order_type, addons, activeAddons, quantity, total_price } = menuItemDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE selected_menu_items 
                 SET order_id = ?, name = ?, price = ?, description = ?, status = ?, categories = ?, type = ?, order_type = ?, addons = ?, activeAddons = ?, quantity = ?, total_price = ?, created_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [order_id, name, price, description, status, JSON.stringify(categories), type, order_type, JSON.stringify(addons), JSON.stringify(activeAddons), quantity, total_price, id],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, message: 'Menu Item Updated' });
                }
            );
        });
    });

    // ===================== DELETE SELECTED MENU ITEM =====================
    ipcMain.handle('delete-selected-menu-item', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM selected_menu_items WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'Menu Item Deleted' });
            });
        });
    });

    // ===================== DELETE ALL SELECTED MENU ITEMS =====================
    ipcMain.handle('delete-all-selected-menu-items', async () => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM selected_menu_items`, function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'All Menu Items Deleted' });
            });
        });
    });
}

module.exports = { setupSelectedMenuItemsHandlers };
