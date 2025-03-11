const db = require('./database');

function setupMenuOffersHandlers(ipcMain) {
    // ===================== CREATE MENU OFFER =====================
    ipcMain.handle('create-menu-offer', async (event, offerDetails) => {
        const {
            type, name, order_id = null, order_type = null, fixed = 0, value,
            code = null, selected = 0, categories = null, items = null, day = null,
            startTime = null, endTime = null, startDate = null, endDate = null,
            min_order_amount = 0, max_discount = null, usage_limit = null,
            used_count = 0, status = "active", auto_apply = 0, applies_to = "subtotal"
        } = offerDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO menu_offers 
                 (type, name, order_id, order_type, fixed, value, code, selected, categories, items, 
                  day, startTime, endTime, startDate, endDate, min_order_amount, max_discount, usage_limit, 
                  used_count, status, auto_apply, applies_to, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [type, name, order_id, order_type, fixed, value, code, selected, categories, items,
                    day, startTime, endTime, startDate, endDate, min_order_amount, max_discount, usage_limit,
                    used_count, status, auto_apply, applies_to],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, message: 'Menu Offer Created' });
                }
            );
        });
    });

    // ===================== FETCH ALL MENU OFFERS =====================
    ipcMain.handle('fetch-menu-offers', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM menu_offers ORDER BY created_at DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    // ===================== UPDATE MENU OFFER =====================
    ipcMain.handle('update-menu-offer', async (event, id, updatedDetails) => {
        const {
            type, name, order_id, order_type, fixed, value, code, selected, categories,
            items, day, startTime, endTime, startDate, endDate, min_order_amount,
            max_discount, usage_limit, used_count, status, auto_apply, applies_to
        } = updatedDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE menu_offers 
                 SET type = ?, name = ?, order_id = ?, order_type = ?, fixed = ?, value = ?, code = ?, 
                     selected = ?, categories = ?, items = ?, day = ?, startTime = ?, endTime = ?, 
                     startDate = ?, endDate = ?, min_order_amount = ?, max_discount = ?, usage_limit = ?, 
                     used_count = ?, status = ?, auto_apply = ?, applies_to = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [type, name, order_id, order_type, fixed, value, code, selected, categories,
                    items, day, startTime, endTime, startDate, endDate, min_order_amount,
                    max_discount, usage_limit, used_count, status, auto_apply, applies_to, id],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else if (this.changes === 0) reject({ success: false, error: 'Menu Offer not found' });
                    else resolve({ success: true, message: 'Menu Offer Updated' });
                }
            );
        });
    });


    // ===================== UPDATE ORDER ID  =====================
    ipcMain.handle("menuOffers:update", async (event, data) => {
        try {

            const {id, order_ids} = data;

            if (!id) {
                throw new Error("Menu Offer ID is required.");
            }
            if (!Array.isArray(order_ids)) {
                throw new Error("order_ids must be an array.");
            }
    
            console.log("Updating Menu Offer ID:", id, "with Order IDs:", order_ids);
    
            // Convert array to JSON string
            const newOrderIdValue = JSON.stringify(order_ids.length > 0 ? order_ids : []);
    
            // Update the database
            await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE menu_offers SET order_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [newOrderIdValue, id],
                    function (err) {
                        if (err) {
                            console.error("Database Update Error:", err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
    
            return { success: true, message: "Menu offer updated successfully." };
        } catch (error) {
            console.error("Error updating menu offer:", error);
            return { success: false, error: error.message };
        }
    });
    


    // ===================== DELETE MENU OFFER =====================
    ipcMain.handle('delete-menu-offer', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM menu_offers WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else if (this.changes === 0) reject({ success: false, error: 'Menu Offer not found' });
                else resolve({ success: true, message: 'Menu Offer Deleted' });
            });
        });
    });
}

module.exports = { setupMenuOffersHandlers };
