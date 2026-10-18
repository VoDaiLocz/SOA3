const jwt = require('jsonwebtoken');

// Cấu hình URL Auth Service (Lab 2) và JWT Secret dùng chung
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/auth';
const JWT_SECRET = process.env.JWT_SECRET || 'soa_lab2_jwt_secret_key_2026';

/**
 * Middleware xác thực yêu cầu dựa trên Auth Service ở Bài thực hành số 2
 */
async function authenticate(req, res, next) {
  let token = req.headers['authorization'] || req.headers['x-access-token'] || req.headers['token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối. Vui lòng cung cấp Token xác thực qua header [Authorization: Bearer <token>].'
    });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  // Cách 1 (Chuẩn SOA): Gửi request HTTP sang Auth Service (port 3000) để xác thực
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout 2s

    const response = await fetch(AUTH_SERVICE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      req.user = data.user;
      return next();
    } else {
      const errorData = await response.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: 'Xác thực thất bại từ Auth Service.',
        error: errorData.message || 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }
  } catch (netErr) {
    // Cách 2 (Fallback): Khi Auth Service port 3000 chưa bật, giải mã trực tiếp bằng JWT_SECRET của Lab 2
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
        error: jwtErr.message
      });
    }
  }
}

module.exports = {
  authenticate,
  JWT_SECRET,
  AUTH_SERVICE_URL
};
