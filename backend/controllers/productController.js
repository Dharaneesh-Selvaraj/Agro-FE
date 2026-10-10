const { getPool } = require('../config/db');

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
