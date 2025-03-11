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
    day_starts: [
        { "name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT" },
        { "name": "openingCash", "type": "TEXT" },
        { "name": "openTime", "type": "DATETIME" },
        { "name": "comment", "type": "TEXT" },
        { "name": "openBy", "type": "TEXT", "foreign": "REFERENCES users(user_id)" },
        { "name": "created_at", "type": "DATETIME DEFAULT CURRENT_TIMESTAMP" }
    ],
    selected_menu_items: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'order_id', type: 'INTEGER', foreign: 'REFERENCES orders(id) ON DELETE CASCADE' },
        { name: 'name', type: 'TEXT' },
        { name: 'price', type: 'REAL' },
        { name: 'description', type: 'TEXT' },
        { name: 'status', type: 'TEXT DEFAULT "enable"' },
        { name: 'categories', type: 'TEXT' }, // JSON string
        { name: 'type', type: 'TEXT' },
        { name: 'order_type', type: 'TEXT' },
        { name: 'addons', type: 'TEXT' }, // JSON string
        { name: 'activeAddons', type: 'TEXT' }, // JSON string
        { name: 'quantity', type: 'INTEGER DEFAULT 1' },
        { name: 'total_price', type: 'REAL' },
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    orders: [
        { "name": "id", "type": "INTEGER PRIMARY KEY AUTOINCREMENT" },
        { "name": "order_type", "type": "TEXT", "constraint": "CHECK(order_type IN ('dine_in', 'quick_bill', 'pickup'))" },
        { "name": "status", "type": "TEXT DEFAULT 'pending'" },
        { "name": "created_at", "type": "DATETIME DEFAULT CURRENT_TIMESTAMP" }
    ],
    tables: [
        { name: 'order_id', type: 'INTEGER', foreign: 'REFERENCES orders(id) ON DELETE CASCADE' },
        { name: 'area', type: 'TEXT NOT NULL' },
        { name: 'tableNumber', type: 'TEXT NOT NULL UNIQUE' },
        { name: 'seatingCapacity', type: 'INTEGER NOT NULL CHECK(seatingCapacity > 0)' },
        { name: 'shape', type: 'TEXT CHECK(shape IN ("circle", "square", "rectangle")) NOT NULL' },
        { name: 'status', type: 'TEXT DEFAULT "available" CHECK(status IN ("available", "reserved", "available_soon"))' },
        { name: 'selected', type: 'INTEGER DEFAULT 0 CHECK(selected IN (0, 1))' },  // 0 = not selected, 1 = selected
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    discounts: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'name', type: 'TEXT NOT NULL' },
        { name: 'order_type', type: 'TEXT NOT NULL' }, // JSON string ["dinein", "pickup"]
        { name: 'fixed', type: 'INTEGER DEFAULT 0 CHECK(fixed IN (0,1))' }, // 0 = Percentage, 1 = Fixed amount
        { name: 'value', type: 'REAL NOT NULL' }, // Discount value
        { name: 'code', type: 'TEXT UNIQUE NOT NULL' }, // Discount code
        { name: 'categories', type: 'TEXT NOT NULL' }, // JSON string ["Pizza"]
        { name: 'items', type: 'TEXT NOT NULL' }, // JSON string ["Margherita Pizza", "Pepperoni Pizza"]
        { name: 'day', type: 'TEXT NOT NULL' }, // JSON string ["Sunday", "Monday"]
        { name: 'startTime', type: 'TEXT NOT NULL' }, // "11:00 AM"
        { name: 'endTime', type: 'TEXT NOT NULL' }, // "03:00 PM"
        { name: 'startDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'endDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    charges: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'name', type: 'TEXT NOT NULL' }, // Charge name
        { name: 'order_type', type: 'TEXT NOT NULL' }, // JSON string ["dinein", "pickup"]
        { name: 'fixed', type: 'BOOLEAN DEFAULT 0' }, // 0 = Percentage, 1 = Fixed amount
        { name: 'value', type: 'REAL NOT NULL' }, // Charge value
        { name: 'code', type: 'TEXT UNIQUE NOT NULL' }, // Charge code
        { name: 'categories', type: 'TEXT NOT NULL' }, // JSON string ["Pizza"]
        { name: 'items', type: 'TEXT NOT NULL' }, // JSON string ["Margherita Pizza", "Pepperoni Pizza"]
        { name: 'day', type: 'TEXT NOT NULL' }, // JSON string ["Sunday", "Monday"]
        { name: 'startTime', type: 'TEXT NOT NULL' }, // "11:00 AM"
        { name: 'endTime', type: 'TEXT NOT NULL' }, // "03:00 PM"
        { name: 'startDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'endDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],
    coupons: [
        { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'name', type: 'TEXT NOT NULL' }, // Coupon name
        { name: 'order_type', type: 'TEXT NOT NULL' }, // JSON string ["dinein", "pickup"]
        { name: 'fixed', type: 'BOOLEAN DEFAULT 0' }, // 0 = Percentage, 1 = Fixed amount
        { name: 'value', type: 'REAL NOT NULL' }, // Discount value
        { name: 'code', type: 'TEXT UNIQUE NOT NULL' }, // Coupon code
        { name: 'categories', type: 'TEXT NOT NULL' }, // JSON string ["Pizza"]
        { name: 'items', type: 'TEXT NOT NULL' }, // JSON string ["Margherita Pizza", "Pepperoni Pizza"]
        { name: 'day', type: 'TEXT NOT NULL' }, // JSON string ["Sunday", "Monday"]
        { name: 'startTime', type: 'TEXT NOT NULL' }, // "11:00 AM"
        { name: 'endTime', type: 'TEXT NOT NULL' }, // "03:00 PM"
        { name: 'startDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'endDate', type: 'DATE NOT NULL' }, // YYYY-MM-DD
        { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ],


};

// Function to initialize or update tables
function initializeDatabase() {
    db.serialize(() => {
        Object.entries(tables).forEach(([tableName, columns]) => {
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
