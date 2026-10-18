const db = require('../database');

/**
 * Controller xử lý các nghiệp vụ quản lý sản phẩm
 */

// 1. GET /products - Lấy danh sách tất cả sản phẩm
async function getAllProducts(req, res) {
  try {
    const products = await db.getAllProducts();
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công.',
      total: products.length,
      data: products
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi lấy danh sách sản phẩm.',
      error: error.message
    });
  }
}

// 2. GET /products/:id - Lấy thông tin chi tiết một sản phẩm
async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ. Vui lòng cung cấp một số nguyên dương.'
      });
    }

    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID = ${id}.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin sản phẩm thành công.',
      data: product
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết sản phẩm:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi lấy chi tiết sản phẩm.',
      error: error.message
    });
  }
}

// 3. POST /products - Thêm một sản phẩm mới
async function createProduct(req, res) {
  try {
    const { name, description, price, quantity } = req.body;

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm (name) là bắt buộc và không được để trống.'
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá sản phẩm (price) là bắt buộc và phải là số >= 0.'
      });
    }

    const parsedQuantity = quantity !== undefined ? parseInt(quantity, 10) : 0;
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm (quantity) phải là số nguyên >= 0.'
      });
    }

    const newProduct = await db.createProduct({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      quantity: parsedQuantity
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm mới thành công!',
      data: newProduct
    });
  } catch (error) {
    console.error('Lỗi thêm sản phẩm mới:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi thêm sản phẩm.',
      error: error.message
    });
  }
}

// 4. PUT /products/:id - Cập nhật thông tin sản phẩm
async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ.'
      });
    }

    const { name, description, price, quantity } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm (name) không được để trống.'
      });
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Giá sản phẩm (price) phải là số >= 0.'
      });
    }

    if (quantity !== undefined && (isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng sản phẩm (quantity) phải là số nguyên >= 0.'
      });
    }

    const updated = await db.updateProduct(id, {
      name: name ? name.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      price: price !== undefined ? Number(price) : undefined,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : undefined
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID = ${id} để cập nhật.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sản phẩm thành công!',
      data: updated
    });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi cập nhật sản phẩm.',
      error: error.message
    });
  }
}

// 5. DELETE /products/:id - Xóa một sản phẩm
async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ.'
      });
    }

    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID = ${id} để xóa.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa thành công sản phẩm: ${deleted.name} (ID: ${id})`,
      data: deleted
    });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi xóa sản phẩm.',
      error: error.message
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
