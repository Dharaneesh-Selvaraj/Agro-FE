const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;

async function initDB() {
  try {
    // 1. Connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'agrosystem';
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database \`${dbName}\` ensured.`);
    await connection.end();

    // 2. Connect to the created database using a pool
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });

    // 3. Create customers table
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createCustomersTable);
    console.log("Customers table ensured.");

    // 4. Create products table
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        category VARCHAR(100) DEFAULT 'General',
        subCategory VARCHAR(100) DEFAULT 'General',
        image VARCHAR(255),
        rating DECIMAL(3, 1) DEFAULT 0,
        reviews INT DEFAULT 0,
        tags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createProductsTable);
    console.log("Products table ensured.");

    // 5. Auto-seed products if table is empty
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM products");
    if (countRows[0].count === 0) {
      console.log("Products table is empty. Auto-seeding from seed.sql...");
      const fs = require('fs');
      const path = require('path');
      const sqlFile = path.join(__dirname, '..', 'seed.sql');
      if (fs.existsSync(sqlFile)) {
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        await pool.query(sqlContent);
        console.log("Successfully seeded 147 products into MySQL!");
      } else {
        console.warn("seed.sql file not found at", sqlFile);
      }
    } else {
      console.log(`Database already has ${countRows[0].count} products.`);
    }
    
    return pool;
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1); // Stop the server if DB fails
  }
}

// Export a function to get the pool
function getPool() {
  if (!pool) {
    throw new Error("Database not initialized yet.");
  }
  return pool;
}

module.exports = { initDB, getPool };
