const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Khởi tạo CSDL SQLite (bảng products và seed data mẫu)
require('./database');

const productRoutes = require('./routes/productRoutes');

const app = express();
// Khởi tạo cổng riêng cho Product Service (tuân thủ SOA - Đề bài gợi ý localhost:***1, chọn 3001)
const PORT = process.env.PORT || 3001;

// Middlewares cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tích hợp Swagger UI tại /api-docs để test trực quan
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Trang chủ hiển thị thông tin dịch vụ
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Product Management Service (SOA Lab 3)',
    port: PORT,
    endpoints: {
      swagger: `http://localhost:${PORT}/api-docs`,
      getAllProducts: `GET http://localhost:${PORT}/products`,
      getProductById: `GET http://localhost:${PORT}/products/:id`,
      createProduct: `POST http://localhost:${PORT}/products (Cần Token Auth Service)`,
      updateProduct: `PUT http://localhost:${PORT}/products/:id (Cần Token Auth Service)`,
      deleteProduct: `DELETE http://localhost:${PORT}/products/:id (Cần Token Auth Service)`
    }
  });
});

// Gắn Router quản lý sản phẩm
app.use('/', productRoutes);

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.url} không tồn tại trên Product Service.`
  });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi máy chủ nội bộ.',
    error: err.message
  });
});

// Khởi động server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SOA Lab 3 - Product Service đang chạy tại: http://localhost:${PORT}`);
    console.log(`📖 Tài liệu Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`📦 Lấy danh sách sản phẩm: GET http://localhost:${PORT}/products`);
    console.log(`➕ Thêm sản phẩm mới: POST http://localhost:${PORT}/products`);
    console.log(`🔒 Xác thực liên dịch vụ qua: http://localhost:3000/auth`);
    console.log(`====================================================`);
  });
}

module.exports = app;
