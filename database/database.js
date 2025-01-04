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

// Create `orders` table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId TEXT,
            orderType TEXT,
            userInfo TEXT,
            discount TEXT,
            coupon TEXT,
            additionCharges TEXT,
            selectedMenuList TEXT,
            status INTEGER DEFAULT NULL,   -- fulfilled -> 0, canceled -> 1, refunded -> 2
            orderDate TEXT,
            orderTime TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
