const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Lỗi kết nối CSDL SQLite (products.db):', err.message);
  } else {
    console.log('✅ Đã kết nối thành công CSDL SQLite riêng cho Product Service (products.db)');
  }
});

// Khởi tạo bảng products và chèn dữ liệu mẫu
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Lỗi tạo bảng products:', err.message);
      return;
    }

    // Kiểm tra và thêm dữ liệu mẫu nếu bảng còn trống
    db.get('SELECT COUNT(*) AS count FROM products', (countErr, row) => {
      if (!countErr && row.count === 0) {
        console.log('📦 Đang khởi tạo dữ liệu mẫu cho bảng products...');
        const stmt = db.prepare(`
          INSERT INTO products (name, description, price, quantity)
          VALUES (?, ?, ?, ?)
        `);

        const sampleProducts = [
          ['Laptop Dell XPS 15', 'Laptop cao cấp mỏng nhẹ, CPU Intel Core i7, RAM 16GB, SSD 512GB', 35000000, 10],
          ['Bàn phím cơ Keychron K2', 'Bàn phím cơ không dây Bluetooth, Gateron G Pro Brown switch', 1850000, 25],
          ['Chuột không dây Logitech MX Master 3S', 'Chuột công thái học cao cấp, cảm biến 8000 DPI, cuộn MagSpeed', 2490000, 30],
          ['Màn hình Dell UltraSharp U2723QE', 'Màn hình đồ họa 27 inch 4K IPS Black, độ bao phủ 98% DCI-P3', 13900000, 8],
          ['Tai nghe Sony WH-1000XM5', 'Tai nghe chống ồn chủ động đỉnh cao, thời lượng pin 30 giờ', 7990000, 15]
        ];

        sampleProducts.forEach(prod => stmt.run(prod));
        stmt.finalize();
        console.log('✅ Đã tạo 5 sản phẩm mẫu thành công!');
      }
    });
  });
});

// Các hàm truy vấn dữ liệu Promise-based phục vụ Controller
function getAllProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products ORDER BY id ASC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function createProduct({ name, description, price, quantity }) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO products (name, description, price, quantity, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    db.run(query, [name, description || '', price, quantity || 0], function (err) {
      if (err) reject(err);
      else {
        // Lấy lại bản ghi vừa tạo
        db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (getErr, row) => {
          if (getErr) reject(getErr);
          else resolve(row);
        });
      }
    });
  });
}

function updateProduct(id, { name, description, price, quantity }) {
  return new Promise((resolve, reject) => {
    // Lấy thông tin hiện tại để cho phép cập nhật từng phần (partial update)
    db.get('SELECT * FROM products WHERE id = ?', [id], (getErr, current) => {
      if (getErr) return reject(getErr);
      if (!current) return resolve(null);

      const updatedName = name !== undefined ? name : current.name;
      const updatedDescription = description !== undefined ? description : current.description;
      const updatedPrice = price !== undefined ? price : current.price;
      const updatedQuantity = quantity !== undefined ? quantity : current.quantity;

      const query = `
        UPDATE products
        SET name = ?, description = ?, price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(query, [updatedName, updatedDescription, updatedPrice, updatedQuantity, id], function (err) {
        if (err) return reject(err);

        db.get('SELECT * FROM products WHERE id = ?', [id], (err2, row) => {
          if (err2) reject(err2);
          else resolve(row);
        });
      });
    });
  });
}

function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], (getErr, current) => {
      if (getErr) return reject(getErr);
      if (!current) return resolve(null);

      db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve(current);
      });
    });
  });
}

module.exports = {
  db,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
