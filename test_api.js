const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middlewares/authMiddleware');

// Sinh token test giả lập từ Auth Service Lab 2
const testToken = jwt.sign(
  { idUser: 1, userName: 'admin_test' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG DỊCH VỤ QUẢN LÝ SẢN PHẨM (SOA 3)');
  console.log('🧪 ========================================================\n');

  let createdId = null;

  try {
    // Test 1: Lấy danh sách sản phẩm (GET /products)
    console.log('1️⃣  Kiểm tra: GET /products (Lấy danh sách tất cả sản phẩm)');
    const res1 = await fetch(`${BASE_URL}/products`);
    const data1 = await res1.json();
    console.log(`   👉 Trạng thái: HTTP ${res1.status}`);
    console.log(`   👉 Tổng số sản phẩm hiện tại: ${data1.total}`);
    if (res1.status === 200 && Array.isArray(data1.data)) {
      console.log('   ✅ Test 1: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 1 Thất bại');
    }

    // Test 2: Lấy chi tiết sản phẩm ID = 1 (GET /products/1)
    console.log('2️⃣  Kiểm tra: GET /products/1 (Lấy chi tiết sản phẩm ID = 1)');
    const res2 = await fetch(`${BASE_URL}/products/1`);
    const data2 = await res2.json();
    console.log(`   👉 Trạng thái: HTTP ${res2.status}`);
    console.log(`   👉 Tên sản phẩm: "${data2.data?.name}" - Giá: ${data2.data?.price} VNĐ`);
    if (res2.status === 200 && data2.data?.id === 1) {
      console.log('   ✅ Test 2: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 2 Thất bại');
    }

    // Test 3: Thêm sản phẩm mà KHÔNG có token (POST /products) -> Phải bị từ chối 401
    console.log('3️⃣  Kiểm tra: POST /products khi KHÔNG CÓ TOKEN (Phải trả về 401)');
    const res3 = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Màn hình test hack',
        price: 5000000
      })
    });
    const data3 = await res3.json();
    console.log(`   👉 Trạng thái: HTTP ${res3.status} (${data3.message})`);
    if (res3.status === 401) {
      console.log('   ✅ Test 3 (Bảo mật Auth Service): THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 3 Thất bại: Chưa bảo vệ endpoint bằng xác thực');
    }

    // Test 4: Thêm sản phẩm mới CÓ TOKEN (POST /products)
    console.log('4️⃣  Kiểm tra: POST /products CÓ TOKEN HỢP LỆ (Thêm sản phẩm mới)');
    const newProductPayload = {
      name: 'Bàn phím cơ FL-Esports OG87',
      description: 'Bàn phím cơ thiết kế Retro Vintage, switch TTC Neptune, gõ êm mượt',
      price: 2650000,
      quantity: 12
    };

    const res4 = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(newProductPayload)
    });
    const data4 = await res4.json();
    console.log(`   👉 Trạng thái: HTTP ${res4.status}`);
    console.log(`   👉 Đã tạo sản phẩm ID = ${data4.data?.id} - Tên: "${data4.data?.name}"`);
    if (res4.status === 201 && data4.data?.id) {
      createdId = data4.data.id;
      console.log('   ✅ Test 4: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 4 Thất bại');
    }

    // Test 5: Cập nhật thông tin sản phẩm vừa tạo (PUT /products/:id)
    console.log(`5️⃣  Kiểm tra: PUT /products/${createdId} CÓ TOKEN (Cập nhật giá và số lượng)`);
    const updatePayload = {
      price: 2450000,
      quantity: 20,
      description: 'Đã giảm giá 200.000đ cho khách hàng thân thiết'
    };

    const res5 = await fetch(`${BASE_URL}/products/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(updatePayload)
    });
    const data5 = await res5.json();
    console.log(`   👉 Trạng thái: HTTP ${res5.status}`);
    console.log(`   👉 Giá mới: ${data5.data?.price} VNĐ - Số lượng mới: ${data5.data?.quantity}`);
    if (res5.status === 200 && Number(data5.data?.price) === 2450000) {
      console.log('   ✅ Test 5: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 5 Thất bại');
    }

    // Test 6: Xóa sản phẩm vừa tạo (DELETE /products/:id)
    console.log(`6️⃣  Kiểm tra: DELETE /products/${createdId} CÓ TOKEN (Xóa sản phẩm)`);
    const res6 = await fetch(`${BASE_URL}/products/${createdId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    const data6 = await res6.json();
    console.log(`   👉 Trạng thái: HTTP ${res6.status} (${data6.message})`);
    if (res6.status === 200) {
      console.log('   ✅ Test 6: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 6 Thất bại');
    }

    // Test 7: Kiểm tra lại sản phẩm đã xóa (GET /products/:id) -> Phải trả về 404
    console.log(`7️⃣  Kiểm tra: GET /products/${createdId} SAU KHI XÓA (Phải trả về 404 Not Found)`);
    const res7 = await fetch(`${BASE_URL}/products/${createdId}`);
    const data7 = await res7.json();
    console.log(`   👉 Trạng thái: HTTP ${res7.status} (${data7.message})`);
    if (res7.status === 404) {
      console.log('   ✅ Test 7: THÀNH CÔNG!\n');
    } else {
      throw new Error('Test 7 Thất bại: Sản phẩm vẫn còn tồn tại sau khi xóa');
    }

    console.log('🎉 ========================================================');
    console.log('🎉 TẤT CẢ CÁC BÀI TEST ĐỀU ĐẠT CHUẨN 100%! HỆ THỐNG SẴN SÀNG NỘP');
    console.log('🎉 ========================================================');
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err.message);
    process.exit(1);
  }
}

// Chạy test
runTests();
