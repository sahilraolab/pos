const db = require('./database');

function setupUserHandlers(ipcMain) {
    // ===================== USERS =====================
    ipcMain.handle('create-user', async (event, userDetails) => {
        const { name, role, user_id, status = 'Active' } = userDetails;

        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, existingUser) => {
                if (err) {
                    return reject({ success: false, error: err.message });
                }

                if (existingUser) {
                    // If user exists, update their details
                    db.run(
                        `UPDATE users SET name = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
                        [name, role, status, user_id],
                        function (updateErr) {
                            if (updateErr) reject({ success: false, error: updateErr.message });
                            else resolve({ success: true, message: 'User updated' });
                        }
                    );
                } else {
                    // If user does not exist, insert a new record
                    db.run(
                        `INSERT INTO users (name, role, user_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        [name, role, user_id, status],
                        function (insertErr) {
                            if (insertErr) reject({ success: false, error: insertErr.message });
                            else resolve({ success: true, userId: this.lastID, message: 'User created' });
                        }
                    );
                }
            });
        });
    });

    ipcMain.handle('fetch-users', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM users ORDER BY created_at DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    ipcMain.handle('delete-user', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'User deleted' });
            });
        });
    });

    // ===================== SHIFTS =====================
    ipcMain.handle('create-shift', async (event, shiftDetails) => {
        const { user_id, shift_id, punch_in, status = 'Active' } = shiftDetails;
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO shifts (user_id, shift_id, punch_in, status) VALUES (?, ?, ?, ?)`,
                [user_id, shift_id, punch_in, status],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, shiftId: this.lastID });
                }
            );
        });
    });

    ipcMain.handle('fetch-shifts', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM shifts ORDER BY punch_in DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    ipcMain.handle('update-shift', async (event, shiftDetails) => {
        const { id, logout, total_hours, status } = shiftDetails;
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE shifts SET logout = ?, total_hours = ?, status = ? WHERE id = ?`,
                [logout, total_hours, status, id],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, message: 'Shift updated' });
                }
            );
        });
    });

    ipcMain.handle('delete-shift', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM shifts WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'Shift deleted' });
            });
        });
    });

    // ===================== BREAKS =====================
    ipcMain.handle('create-break', async (event, breakDetails) => {
        const { shift_id, start_time, end_time } = breakDetails;
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO breaks (shift_id, start_time, end_time) VALUES (?, ?, ?)`,
                [shift_id, start_time, end_time],
                function (err) {
                    if (err) reject({ success: false, error: err.message });
                    else resolve({ success: true, breakId: this.lastID });
                }
            );
        });
    });

    ipcMain.handle('fetch-breaks', async () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM breaks ORDER BY start_time DESC`, (err, rows) => {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, data: rows });
            });
        });
    });

    ipcMain.handle('delete-break', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM breaks WHERE id = ?`, [id], function (err) {
                if (err) reject({ success: false, error: err.message });
                else resolve({ success: true, message: 'Break deleted' });
            });
        });
    });
}

module.exports = { setupUserHandlers };
