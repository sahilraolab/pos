const db = require('./database');

function setupDayStartHandlers(ipcMain) {
    // ===================== DAY START =====================
    ipcMain.handle('create-daystart', async (event, dayStartDetails) => {
        const { openingCash, openTime, comment, openBy } = dayStartDetails;
    
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO day_starts (openingCash, openTime, comment, openBy, created_at) 
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [openingCash, openTime, comment, openBy],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, dayStartId: this.lastID, message: 'Day Start Created' });
                }
            );
        });
    });    

    ipcMain.handle('fetch-daystarts', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM day_starts ORDER BY created_at DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    ipcMain.handle('delete-daystart', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM day_starts WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'Day Start deleted' });
            });
        });
    });
}

module.exports = { setupDayStartHandlers };
