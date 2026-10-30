const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products/seed or POST /api/products/seed
router.get('/seed', productController.seedProducts);
router.post('/seed', productController.seedProducts);

// POST /api/products/truncate or DELETE /api/products/truncate
router.post('/truncate', productController.truncateProducts);
router.delete('/truncate', productController.truncateProducts);

// GET /api/products
router.get('/', productController.getProducts);

// POST /api/products/bulk-upload
router.post('/bulk-upload', productController.bulkUploadProducts);

// POST /api/products
router.post('/', productController.addProduct);

// PUT /api/products/:id
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
