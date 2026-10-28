const { getPool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Seed products from seed.sql
exports.seedProducts = async (req, res) => {
  try {
    const pool = getPool();
    const sqlFile = path.join(__dirname, '..', 'seed.sql');
    if (!fs.existsSync(sqlFile)) {
      return res.status(404).json({ error: 'seed.sql file not found on server.' });
    }
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    await pool.query(sqlContent);
    const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM products');
    res.status(200).json({ 
      success: true, 
      message: `Successfully seeded ${countRows[0].count} products into MySQL!`, 
      count: countRows[0].count 
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({ error: 'Failed to seed products: ' + (error.message || error) });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const pool = getPool();
    const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // Ensure tags are parsed properly if stored as JSON
    const formattedProducts = products.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || [])
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  const { name, price, description, category, subCategory, image, tags } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  try {
    const pool = getPool();
    const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);

    const query = `
      INSERT INTO products 
      (name, price, description, category, subCategory, image, tags) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name, 
      price || 0, 
      description || '', 
      category || 'General', 
      subCategory || 'General', 
      image || '', 
      tagsJson
    ];

    const [result] = await pool.query(query, values);
    
    // Fetch and return the newly created product
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    
    const formattedProduct = {
      ...newProduct[0],
      tags: typeof newProduct[0].tags === 'string' ? JSON.parse(newProduct[0].tags) : (newProduct[0].tags || [])
    };

    res.status(201).json({ message: 'Product added successfully.', product: formattedProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: 'Server error adding product.' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = getPool();
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, subCategory, image, tags } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  try {
    const pool = getPool();
    const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);
    
    // First, verify product exists
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const currentImage = existing[0].image;
    // If no new image is provided, keep the old one
    const imageToSave = image || currentImage;

    const query = `
      UPDATE products 
      SET name = ?, price = ?, description = ?, category = ?, subCategory = ?, image = ?, tags = ?
      WHERE id = ?
    `;
    const values = [
      name, 
      price || 0, 
      description || '', 
      category || 'General', 
      subCategory || 'General', 
      imageToSave, 
      tagsJson,
      id
    ];

    await pool.query(query, values);
    
    // Fetch and return the updated product
    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    const formattedProduct = {
      ...updatedProduct[0],
      tags: typeof updatedProduct[0].tags === 'string' ? JSON.parse(updatedProduct[0].tags) : (updatedProduct[0].tags || [])
    };

    res.status(200).json({ message: 'Product updated successfully.', product: formattedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: 'Server error updating product.' });
  }
};

// POST /api/products/bulk-upload - Bulk upload products from Excel/JSON
exports.bulkUploadProducts = async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No product data provided. Expecting an array of products.' });
  }

  try {
    const pool = getPool();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i] || {};
      const name = String(p.name || p.productName || p.title || '').trim();

      if (!name) {
        skipped++;
        errors.push({ row: i + 1, reason: 'Product name is required' });
        continue;
      }

      // Parse price
      let cleanPrice = String(p.price || '').replace(/[^\d.]/g, '');
      const price = isNaN(parseFloat(cleanPrice)) ? 0 : parseFloat(cleanPrice);

      const category = String(p.category || 'General').trim() || 'General';
      const subCategory = String(p.subCategory || p.subcategory || 'General').trim() || 'General';
      const description = String(p.description || p.desc || '').trim();
      const image = String(p.image || p.imageUrl || p.imageLink || p.image_url || '').trim() ||
        `https://placehold.co/400x600/e2e8f0/1e293b.png?text=${encodeURIComponent(name.slice(0, 20))}`;

      // Process tags
      let tags = [];
      if (Array.isArray(p.tags)) {
        tags = p.tags;
      } else if (typeof p.tags === 'string' && p.tags.trim()) {
        try {
          const parsed = JSON.parse(p.tags);
          if (Array.isArray(parsed)) tags = parsed;
          else tags = [p.tags];
        } catch {
          tags = p.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      if (tags.length === 0) {
        tags = [category, subCategory].filter(t => t && t.toLowerCase() !== 'general');
      }
      const tagsJson = JSON.stringify(tags);

      try {
        // Check if product with this exact name already exists
        const [existing] = await pool.query('SELECT id FROM products WHERE name = ?', [name]);

        if (existing.length > 0) {
          const updateQuery = `
            UPDATE products 
            SET price = ?, category = ?, subCategory = ?, description = ?, image = ?, tags = ?
            WHERE id = ?
          `;
          await pool.query(updateQuery, [price, category, subCategory, description, image, tagsJson, existing[0].id]);
          updated++;
        } else {
          const insertQuery = `
            INSERT INTO products (name, price, category, subCategory, description, image, tags, rating, reviews)
            VALUES (?, ?, ?, ?, ?, ?, ?, 4.5, 12)
          `;
          await pool.query(insertQuery, [name, price, category, subCategory, description, image, tagsJson]);
          inserted++;
        }
      } catch (err) {
        console.error(`Error saving product row ${i + 1} (${name}):`, err);
        skipped++;
        errors.push({ row: i + 1, name, reason: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${products.length} product(s).`,
      stats: {
        total: products.length,
        inserted,
        updated,
        skipped,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error during bulk product upload:', error);
    res.status(500).json({ error: error.message || 'Server error during bulk upload.' });
  }
};

