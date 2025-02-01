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

// Define the table schema
const tableName = 'orders';
const tableColumns = [
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
    { name: 'status', type: 'INTEGER DEFAULT NULL' }, // fulfilled -> 0, canceled -> 1, refunded -> 2
    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
];

// Function to initialize or update the table schema
function initializeTable() {
    db.serialize(() => {
        // Create table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                ${tableColumns.map(col => `${col.name} ${col.type}`).join(', ')}
            )
        `, (err) => {
            if (err) {
                console.error('Failed to create table:', err.message);
                return;
            }

            // Check and add missing columns
            db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
                if (err) {
                    console.error('Failed to fetch table info:', err.message);
                    return;
                }

                const existingColumns = rows.map(row => row.name);

                tableColumns.forEach(({ name, type }) => {
                    if (!existingColumns.includes(name)) {
                        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${name} ${type}`, (err) => {
                            if (err) {
                                console.error(`Failed to add column ${name}:`, err.message);
                            } else {
                                console.log(`Added missing column: ${name}`);
                            }
                        });
                    }
                });
            });
        });
    });
}

initializeTable();

module.exports = db;
