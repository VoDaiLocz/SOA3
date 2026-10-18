const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Định tuyến các API theo đúng yêu cầu đề bài:
 * GET    /products     : Lấy danh sách tất cả các sản phẩm
 * GET    /products/:id : Lấy thông tin chi tiết một sản phẩm
 * POST   /products     : Thêm một sản phẩm mới (Cần xác thực)
 * PUT    /products/:id : Cập nhật thông tin sản phẩm (Cần xác thực)
 * DELETE /products/:id : Xóa một sản phẩm (Cần xác thực)
 */

// 1. Lấy danh sách tất cả các sản phẩm
router.get('/products', productController.getAllProducts);

// 2. Lấy chi tiết một sản phẩm theo ID
router.get('/products/:id', productController.getProductById);

// 3. Thêm một sản phẩm mới (Bảo vệ bằng middleware xác thực qua Auth Service)
router.post('/products', authenticate, productController.createProduct);

// 4. Cập nhật thông tin sản phẩm theo ID (Cần xác thực)
router.put('/products/:id', authenticate, productController.updateProduct);

// 5. Xóa một sản phẩm theo ID (Cần xác thực)
router.delete('/products/:id', authenticate, productController.deleteProduct);

module.exports = router;
