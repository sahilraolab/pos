const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'proerp.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});

// Table definitions
const tables = {
    users: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'user_id', type: 'TEXT UNIQUE' },
        { name: 'status', type: 'TEXT DEFAULT "Active"' },
        { name: 'last_active', type: 'DATETIME' },
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    shifts: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'user_id', type: 'TEXT', foreign: 'REFERENCES users(user_id)' },
        { name: 'shift_id', type: 'TEXT UNIQUE' },
        { name: 'punch_in', type: 'DATETIME' },
        { name: 'logout', type: 'DATETIME' },
        { name: 'total_hours', type: 'TEXT' },
        { name: 'status', type: 'TEXT DEFAULT "Active"' }
    ],
    breaks: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'shift_id', type: 'TEXT', foreign: 'REFERENCES shifts(shift_id)' },
        { name: 'start_time', type: 'DATETIME' },
        { name: 'end_time', type: 'DATETIME' }
    ],
    orders: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'orderId', type: 'TEXT' },
        { name: 'orderType', type: 'TEXT' },
        { name: 'userInfo', type: 'TEXT' },
        { name: 'discount', type: 'TEXT' },
        { name: 'coupon', type: 'TEXT' },
        { name: 'additionCharges', type: 'TEXT' },
        { name: 'selectedMenuList', type: 'TEXT' },
        { name: 'paymentDetails', type: 'TEXT' },
        { name: 'orderSummary', type: 'TEXT' },
        { name: 'tableDetails', type: 'TEXT' },
        { name: 'status', type: 'INTEGER DEFAULT NULL' }, 
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ]
};

// Function to initialize or update tables
function initializeDatabase() {
    db.serialize(() => {
        Object.entries(tables).forEach(([tableName, columns]) => {
            // Create table if it doesn't exist
            db.run(
                `CREATE TABLE IF NOT EXISTS ${tableName} (
                    ${columns.map(col => `${col.name} ${col.type}${col.foreign ? ' ' + col.foreign : ''}`).join(', ')}
                )`,
                (err) => {
                    if (err) {
                        console.error(`Failed to create table ${tableName}:`, err.message);
                        return;
                    }

                    // Check for missing columns and add them dynamically
                    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
                        if (err) {
                            console.error(`Failed to fetch table info for ${tableName}:`, err.message);
                            return;
                        }

                        const existingColumns = rows.map(row => row.name);

                        columns.forEach(({ name, type }) => {
                            if (!existingColumns.includes(name)) {
                                db.run(`ALTER TABLE ${tableName} ADD COLUMN ${name} ${type}`, (err) => {
                                    if (err) {
                                        console.error(`Failed to add column ${name} in ${tableName}:`, err.message);
                                    } else {
                                        console.log(`Added missing column: ${name} in ${tableName}`);
                                    }
                                });
                            }
                        });
                    });
                }
            );
        });
    });
}

initializeDatabase();

module.exports = db;
