const db = require('./database');

function setupTableHandlers(ipcMain) {
    // ===================== CREATE TABLE ENTRY =====================
    ipcMain.handle('create-table', async (event, tableDetails) => {
        const { area, tableNumber, seatingCapacity, shape, status, selected = 0, order_id = null } = tableDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO tables (area, tableNumber, seatingCapacity, shape, status, selected, order_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [area, tableNumber, seatingCapacity, shape, status, selected, order_id],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, message: 'Table Created' });
                }
            );
        });
    });

    // ===================== FETCH ALL TABLES =====================
    ipcMain.handle('fetch-tables', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM tables ORDER BY created_at DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });


    // ===================== UPDATE ORDER ID & SELECTED STATUS =====================
    ipcMain.handle('update-table-selection', async (event, args) => {
        const { tableNumber, order_id, selected } = args;
    
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE tables 
                 SET order_id = ?, selected = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE tableNumber = ?`,
                [order_id, selected, tableNumber],  // Order of parameters matters
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else if (this.changes === 0) reject({ success: false, error: 'Table not found' });
                    else resolve({ success: true, message: 'Table Selection Updated' });
                }
            );
        });
    });
    

    // ===================== UPDATE TABLE STATUS ONLY =====================
    ipcMain.handle('update-table-status', async (event, tableNumber, status) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE tables 
                 SET status = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE tableNumber = ?`,
                [status, tableNumber],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else if (this.changes === 0) reject({ success: false, error: 'Table not found' });
                    else resolve({ success: true, message: 'Table Status Updated' });
                }
            );
        });
    });

    // ===================== UPDATE TABLE DETAILS =====================
    ipcMain.handle('update-table', async (event, tableNumber, updatedDetails) => {
        const { area, seatingCapacity, shape, status, selected, order_id } = updatedDetails;

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE tables 
                 SET area = ?, seatingCapacity = ?, shape = ?, status = ?, selected = ?, order_id = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE tableNumber = ?`,
                [area, seatingCapacity, shape, status, selected, order_id, tableNumber],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else if (this.changes === 0) reject({ success: false, error: 'Table not found' });
                    else resolve({ success: true, message: 'Table Updated' });
                }
            );
        });
    });

    // ===================== DELETE TABLE =====================
    ipcMain.handle('delete-table', async (event, tableNumber) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM tables WHERE tableNumber = ?`, [tableNumber], function (err) {
                if (err) reject({ success: false, error: err.message });
                else if (this.changes === 0) reject({ success: false, error: 'Table not found' });
                else resolve({ success: true, message: 'Table Deleted' });
            });
        });
    });
}

module.exports = { setupTableHandlers };
