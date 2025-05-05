var express = require('express');
var router = express.Router();
var pool = require('../../database/db'); // Đảm bảo đã sử dụng mysql2/promise
var upload = require('../../multerConfig');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Đảm bảo dotenv đã được cài đặt và cấu hình
const baseUrl = process.env.BASE_URL; // Lấy từ .env
const { adminAuth } = require('../auth')



// API VOUCHER------------------------------------------------------------------------------------------------------------------------------------------
// API lấy danh sách voucher
router.get("/vouchers", adminAuth, async (req, res) => {
  const { page = 1, limit = 8 } = req.query;

  // Validate input
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
    return res.status(400).json({ message: "Tham số phân trang không hợp lệ" });
  }

  const offset = (pageNumber - 1) * limitNumber;

  try {
    // Query lấy danh sách voucher có phân trang
    const [vouchers] = await pool.query(`
            SELECT * FROM voucher
            LIMIT ? OFFSET ?
        `, [limitNumber, offset]);

    // Query lấy tổng số voucher
    const [[totalResult]] = await pool.query(`
            SELECT COUNT(*) as total FROM voucher
        `);

    res.json({
      vouchers,
      total: totalResult.total,
      page: pageNumber,
      totalPages: Math.ceil(totalResult.total / limitNumber),
      limit: limitNumber
    });

  } catch (err) {
    console.error("Lỗi lấy voucher:", err);
    res.status(500).json({ message: "Lỗi lấy voucher", error: err.message });
  }
});

router.get("/allvouchers", adminAuth, async (req, res) => {
  try {
    const [vouchers] = await pool.query(`SELECT * FROM voucher`);
    res.json(vouchers);
  } catch (err) {
    console.error("Lỗi lấy tất cả voucher:", err);
    res.status(500).json({ message: "Lỗi lấy tất cả voucher", error: err.message });
  }
})

// API cập nhật voucher
router.put('/voucher/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discount_type,
    discount_value,
    quantity,
    end_date,
    start_date,
    status
  } = req.body;

  try {
    // Kiểm tra mã đã tồn tại 
    const [exists] = await pool.query("SELECT id FROM voucher WHERE code = ? AND id != ?", [code, id]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }

    // Kiểm tra voucher có tồn tại không
    const [rows] = await pool.query("SELECT * FROM voucher WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    // Cập nhật voucher
    const [updateResult] = await pool.query(
      `UPDATE voucher
       SET code=?, discount_type=?, discount_value=?, quantity=?, start_date=?, end_date=?, status=?
       WHERE id=?`,
      [code, discount_type, discount_value, quantity, start_date, end_date, status, id]
    );

    res.json({ message: "Cập nhật voucher thành công!", affectedRows: updateResult.affectedRows });
  } catch (err) {
    console.error("Lỗi cập nhật voucher:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
});


// API xóa voucher
router.delete('/voucher/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM voucher WHERE id = ?";

  try {
    const [result] = await pool.query(sql, [id]);

    // Kiểm tra xem voucher có tồn tại không trước khi xóa
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Voucher không tồn tại!" });
    }

    res.json({ message: "Xóa voucher thành công!", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Lỗi xóa voucher:", err);
    return res.status(500).json({ message: "Lỗi server", error: err });
  }
});


// API thêm voucher
router.post('/voucher', adminAuth, async (req, res) => {
  const { code, discount_type, discount_value, quantity, start_date, end_date, status } = req.body;
  console.log(code, discount_type, discount_value, quantity, start_date, end_date, status)
  // Kiểm tra dữ liệu đầu vào
  if (!code || !discount_type || discount_value == null || quantity == null || start_date == null || !end_date || status == null) {
    return res.status(400).json({ message: "Thiếu dữ liệu đầu vào!" });
  }

  const sql = "INSERT INTO voucher (code, discount_type, discount_value, quantity, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)";

  try {
    // Kiểm tra trùng code
    const [exists] = await pool.query("SELECT id FROM voucher WHERE code = ?", [code]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }

    const [result] = await pool.query(sql, [code, discount_type, discount_value, quantity, start_date, end_date, status]);

    // Kiểm tra xem có thực sự thêm được dữ liệu không
    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Không thể thêm voucher!" });
    }

    res.json({ message: "Thêm voucher thành công!", id: result.insertId });
  } catch (err) {
    console.error("Lỗi thêm voucher:", err);
    return res.status(500).json({ message: "Lỗi server", error: err });
  }
});

// API REVIEWS------------------------------------------------------------------------------------------------------------------------------------------
router.get('/reviews', adminAuth, async function (req, res) {
  try {
    const { page = 1, limit = 8 } = req.query;
    const offset = (page - 1) * limit;

    const [results] = await pool.query(`
            SELECT 
            reviews.id,
            reviews.order_detail_id,
            user.username AS user_name,
            product.name AS product_name,
            order_detail.pr_id,
            reviews.content,
            reviews.star,
            reviews.create_date
        FROM reviews
        JOIN order_detail ON reviews.order_detail_id = order_detail.id
        JOIN product ON order_detail.pr_id = product.id
        JOIN \`order\` ON order_detail.order_id = \`order\`.id
        JOIN user ON \`order\`.user_id = user.id 
        ORDER BY reviews.create_date DESC
        LIMIT 8 OFFSET 0;

        `, [parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM reviews`);

    res.json({ comments: results, total });
  } catch (err) {
    console.error('Lỗi truy vấn dữ liệu:', err);
    res.status(500).json({ error: 'Không thể lấy dữ liệu' });
  }
});

router.get('/allreviews/', adminAuth, async function (req, res) {
  try {
    const [results] = await pool.query(`
            SELECT 
            reviews.id,
            reviews.order_detail_id,
            user.username AS user_name,
            product.name AS product_name,
            order_detail.pr_id,
            reviews.content,
            reviews.star,
            reviews.create_date
    
        FROM reviews
        JOIN order_detail ON reviews.order_detail_id = order_detail.id
        JOIN product ON order_detail.pr_id = product.id
        JOIN \`order\` ON order_detail.order_id = \`order\`.id
        JOIN user ON \`order\`.user_id = user.id 
        ORDER BY reviews.create_date DESC;
        `);

    res.json({ comments: results });
  } catch (err) {
    console.error('Lỗi truy vấn dữ liệu:', err);
    res.status(500).json({ error: 'Không thể lấy dữ liệu' });
  }
})

router.delete('/reviews/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.query(`DELETE FROM reviews WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá để xóa" });
    }

    res.json({ message: "Xóa đánh giá thành công" });
  } catch (err) {
    console.error("Lỗi Xóa đánh giá:", err);
    return res.status(500).json({ message: "Lỗi server", error: err });
  }
});

// API BANNER------------------------------------------------------------------------------------------------------------------------------------------
// GET banners with pagination
router.get("/banners", adminAuth, async (req, res) => {
  const { page = 1, limit = 8 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [banners] = await pool.query(`
            SELECT * FROM banner 
            ORDER BY create_date DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM banner`);

    res.json({ banners, total });
  } catch (err) {
    console.error("Lỗi lấy danh sách banner:", err);
    res.status(500).json({ error: "Không thể lấy danh sách banner" });
  }
});
router.get("/allbanners", adminAuth, async (req, res) => {
  try {
    const [banners] = await pool.query(`SELECT * FROM banner`);
    res.json(banners);
  } catch (err) {
    console.error("Lỗi lấy tất cả banner:", err);
    res.status(500).json({ error: "Không thể lấy tất cả banner" });
  }
});

// Thêm banner mới
router.post('/banner', adminAuth, upload.single('image'), async (req, res) => {

  const { status } = req.body;
  const image = req.file ? `${baseUrl}/public/images/${req.file.filename}` : null;

  if (!image) {
    return res.status(400).json({ message: "Ảnh là bắt buộc!" });
  }

  try {
    console.log(req.file);
    const sql = "INSERT INTO banner (image, status) VALUES (?, ?)";
    const [result] = await pool.query(sql, [image, status]);

    if (result.affectedRows > 0) {
      res.json({ message: "Thêm banner thành công!", id: result.insertId });
    } else {
      res.status(500).json({ message: "Không thể thêm banner!" });
    }
  } catch (err) {
    console.error('Lỗi khi thêm banner:', err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// PUT update banner
// Sửa banner
router.put('/banner/:id', adminAuth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let newImagePath = req.file ? `http://localhost:3000/public/images/${req.file.filename}` : null;

  try {
    const [rows] = await pool.query("SELECT * FROM banner WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Banner không tồn tại!" });
    }

    const oldImagePath = rows[0].image;

    // Nếu có ảnh mới được upload và ảnh cũ tồn tại, thì xóa ảnh cũ
    if (newImagePath && oldImagePath) {
      const fullOldPath = path.join(__dirname, '../../public/images', path.basename(oldImagePath));
      fs.unlink(fullOldPath, (err) => {
        if (err) {
          console.warn(`Không thể xóa ảnh cũ: ${fullOldPath}`, err.message);
        }
      });
    }

    const finalImagePath = newImagePath || oldImagePath;
    const sql = "UPDATE banner SET image = ?, status = ? WHERE id = ?";
    const [result] = await pool.query(sql, [finalImagePath, status, id]);

    if (result.affectedRows > 0) {
      res.json({ message: "Sửa banner thành công!" });
    } else {
      res.status(500).json({ message: "Không thể sửa banner!" });
    }
  } catch (err) {
    console.error('Lỗi khi sửa banner:', err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});


// Xóa banner
router.delete('/banner/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy thông tin banner trước khi xóa
    const [rows] = await pool.query("SELECT * FROM banner WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Banner không tồn tại!" });
    }

    const imagePath = rows[0].image;

    // Xóa banner trong database
    const sql = "DELETE FROM banner WHERE id = ?";
    const [result] = await pool.query(sql, [id]);

    if (result.affectedRows > 0) {
      // Sau khi xóa trong DB, tiếp tục xóa file vật lý
      if (imagePath) {
        const fullImagePath = path.join(__dirname, '../../public/images', path.basename(imagePath));
        fs.unlink(fullImagePath, (err) => {
          if (err) {
            console.warn("Không thể xóa ảnh:", err.message);
          }
        });
      }

      res.json({ message: "Xóa banner thành công!" });
    } else {
      res.status(500).json({ message: "Không thể xóa banner!" });
    }
  } catch (err) {
    console.error('Lỗi khi xóa banner:', err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});


// User API
router.get('/users', adminAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    const [users] = await pool.execute(`SELECT * FROM user ORDER BY  create_date DESC LIMIT ? OFFSET ?`, [limit, offset]);
    const [count] = await pool.execute(`SELECT COUNT(*) AS total FROM user`);
    res.json({ users, total: count[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng' });
  }
});

router.get('/allusers', adminAuth, async (req, res) => {
  try {
    const [users] = await pool.execute(`SELECT * FROM user`);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng' });
  }
});
// Cập nhật status người dùng
router.put('/user/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status === 'undefined') {
    return res.status(400).json({ error: 'Thiếu trường status' });
  }

  try {
    await pool.execute(`UPDATE user SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'Cập nhật trạng thái người dùng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái người dùng' });
  }
});

// Admin order
router.get('/order', adminAuth, async function (req, res) {
  try {
    const { page = 1, limit = 8, order_status } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM \`order\` `;
    let countQuery = `SELECT COUNT(*) AS total FROM \`order\``;
    const conditions = [];
    const params = [];

    // Chỉ thêm điều kiện lọc nếu FE có truyền order_status
    if (order_status !== undefined) {
      conditions.push(`order_status = ?`);
      params.push(parseInt(order_status));
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY create_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [results] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, params.slice(0, conditions.length));

    res.json({ order: results, total });
  } catch (err) {
    console.error('Lỗi truy vấn dữ liệu:', err);
    res.status(500).json({ error: 'Không thể lấy dữ liệu' });
  }
});

router.get(`/allorder`, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT * FROM \`order\` `)
    res.json(result)
  } catch (error) {
    res.json(`Loi lay order`, error)
  }
})

// Lấy chi tiết đơn hàng
router.get("/order_detail/:order_id", async (req, res) => {
  const order_id = req.params.order_id;

  try {
    // Truy vấn thông tin đơn hàng
    const [orderRows] = await pool.query(
      `SELECT *FROM \`order\` WHERE id = ?`,
      [order_id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Truy vấn chi tiết sản phẩm trong đơn hàng
    const [detailRows] = await pool.query(
      `SELECT 
                od.id, 
                od.order_id, 
                od.pr_id, 
                p.name AS product_name, 
                od.quantity, 
                od.price, 
                od.total, 
                od.create_at
             FROM order_detail od
             JOIN product p ON od.pr_id = p.id
             WHERE od.order_id = ?`,
      [order_id]
    );

    // Gửi về frontend theo định dạng:
    res.json({
      order: orderRows[0], // Thông tin đơn hàng
      items: detailRows, // Danh sách sản phẩm
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/order_status/:id', adminAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Kiểm tra đơn hàng tồn tại
    const [order] = await conn.query(
      'SELECT * FROM `order` WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!order.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Đơn hàng không tồn tại" });
    }

    // 2. Validate trạng thái mới
    const newStatus = Number(req.body.order_status);
    const currentStatus = order[0].order_status;

    if (newStatus <= currentStatus) {
      await conn.rollback();
      return res.status(400).json({
        error: `Không thể chuyển từ ${getStatusName(currentStatus)} về ${getStatusName(newStatus)}`
      });
    }

    // 3. Cập nhật trạng thái
    await conn.query(
      'UPDATE `order` SET order_status = ? WHERE id = ?',
      [newStatus, req.params.id]
    );

    await conn.commit();
    res.json({ success: true, message: "Cập nhật thành công!" });

  } catch (err) {
    await conn.rollback();
    console.error("Lỗi server:", err);
    res.status(500).json({
      error: "Lỗi khi cập nhật trạng thái",
      detail: err.message  // Gửi chi tiết lỗi về frontend
    });
  } finally {
    conn.release();
  }
});

// Cập nhật trạng thái thanh toán
router.put('/transaction_status', adminAuth, async (req, res) => {
  const { id, new_transaction_status } = req.body;
  try {
    // Lấy trạng thái
    const order = await pool.query(`SELECT transaction_status FROM \`order\`  WHERE id = ?`, [id]);

    if (order.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const currentStatus = order[0].transaction_status;

    // Nếu đã thanh toán thì không cập nhật lại được
    if (currentStatus === 2 && new_transaction_status === 1) {
      return res.status(400).json({ message: 'Đơn hàng đã thanh toán, không thể chuyển về chưa thanh toán' });
    }

    // Cập nhật trạng thái thanh toán
    await pool.query(`UPDATE \`order\` SET transaction_status = ? WHERE id = ? `, [new_transaction_status, id]);
    res.json({ message: 'Cập nhật trạng thái thành công' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
})

// API DASHBOARD ------------------------------------------------------------------------------------------------------------------------------------------
// API tổng số đơn hàng
router.get('/dashboard/orders', adminAuth, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`order\``);
    res.json({ total });
  } catch (error) {
    console.error("Lỗi khi lấy tổng số đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// API tổng số người dùng
router.get('/dashboard/users', adminAuth, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`user\``);
    res.json({ total });
  } catch (error) {
    console.error("Lỗi khi lấy tổng số người dùng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// api người dùng mới
router.get('/dashboard/users/new', adminAuth, async (req, res) => {
  try {
    const [[{ newUsers }]] = await pool.query(`
      SELECT COUNT(*) AS newUsers
      FROM user
      WHERE DATE(create_date) = CURDATE()
    `);
    res.json({ newUsers });
  } catch (error) {
    console.error("Lỗi khi lấy người dùng mới:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


// API tổng doanh thu theo ngày, tuần, tháng và tổng doanh thu
router.get('/dashboard/revenue/all', adminAuth, async (req, res) => {
  try {
    const [[{ revenueDay }]] = await pool.query(`
      SELECT SUM(total_amount) AS revenueDay
      FROM \`order\`
      WHERE DATE(create_at) = CURDATE()
    `);

    const [[{ revenueWeek }]] = await pool.query(`
      SELECT SUM(total_amount) AS revenueWeek
      FROM \`order\`
      WHERE YEARWEEK(create_at, 1) = YEARWEEK(CURDATE(), 1)
      AND MONTH(create_at) = MONTH(CURDATE())
      AND YEAR(create_at) = YEAR(CURDATE())

    `);

    const [[{ revenueMonth }]] = await pool.query(`
      SELECT SUM(total_amount) AS revenueMonth
      FROM \`order\`
      WHERE MONTH(create_at) = MONTH(CURDATE()) AND YEAR(create_at) = YEAR(CURDATE())
    `);

    const [[{ totalRevenue }]] = await pool.query(`
      SELECT SUM(total_amount) AS totalRevenue FROM \`order\`
    `);

    res.json({
      revenueDay: revenueDay || 0,
      revenueWeek: revenueWeek || 0,
      revenueMonth: revenueMonth || 0,
      totalRevenue: totalRevenue || 0,
    });
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu tổng hợp:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


// API doanh thu theo từng tháng trong năm hiện tại
router.get('/dashboard/revenue/monthly', adminAuth, async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT MONTH(create_at) AS month, SUM(total_amount) AS revenue
      FROM \`order\`
      WHERE YEAR(create_at) = YEAR(CURDATE())
      GROUP BY month
    `);

    const revenuePerMonth = Array(12).fill(0);
    data.forEach(({ month, revenue }) => {
      revenuePerMonth[month - 1] = revenue;
    });

    res.json({ revenuePerMonth });
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu theo tháng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// API doanh thu theo từng năm
router.get('/dashboard/revenue/yearly', async (req, res) => {
  try {
    const [data] = await pool.query(`
      SELECT YEAR(create_at) AS year, SUM(total_amount) AS revenue
      FROM \`order\`
      GROUP BY year
      ORDER BY year
    `);

    res.json({ revenuePerYear: data });
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu theo năm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// API doanh thu theo ngày trong tháng
// API doanh thu theo ngày trong tháng và năm
router.get('/dashboard/revenue/daily/:month', async (req, res) => {
  try {
    const selectedMonth = parseInt(req.params.month, 10);
    const selectedYear = parseInt(req.query.year || new Date().getFullYear(), 10);

    const [data] = await pool.query(`
      SELECT DAY(create_at) AS day, SUM(total_amount) AS revenue
      FROM \`order\`
      WHERE MONTH(create_at) = ? AND YEAR(create_at) = ?
      GROUP BY day
      ORDER BY day
    `, [selectedMonth, selectedYear]);

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const revenuePerDay = Array(daysInMonth).fill(0);

    data.forEach(({ day, revenue }) => {
      revenuePerDay[day - 1] = revenue;
    });

    res.json({ revenuePerDay });
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu theo ngày:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// API trả về danh sách các năm có đơn hàng (có doanh thu)
router.get('/dashboard/revenue/years', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT YEAR(create_at) AS year
      FROM \`order\`
      ORDER BY year DESC
    `);

    const years = rows.map(row => row.year);
    res.json({ years });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách năm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


//API bảng doanh thu theo ngày
// API doanh thu theo ngày kèm thông tin người dùng và trạng thái
router.get('/dashboard/revenue/day/details', adminAuth, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        u.username AS username,
        o.total_amount,
        o.payment_method,
        o.order_status
      FROM \`order\` o
      JOIN \`user\` u ON o.user_id = u.id 
      WHERE DATE(o.create_at) = CURDATE() 
    `);

    // Optional: mapping để dễ hiểu hơn phía frontend
    // Tạo một bảng ánh xạ trạng thái đơn hàng sang mô tả dễ hiểu hơn
    const statusMap = {
      1: "Chờ xác nhận",
      2: "Xác nhận đơn hàng",
      3: "Đang giao hàng",
      4: "Giao hàng thành công"
    };

    const paymentMethodMap = {
      1: "COD",
      2: "VNPAY"
    };

    // Duyệt qua tất cả các đơn hàng và chuyển đổi giá trị theo bảng ánh xạ
    const result = orders.map(order => ({
      username: order.username,
      total_amount: order.total_amount,
      payment_method: paymentMethodMap[order.payment_method] || "Khác",
      order_status: statusMap[order.order_status] || "Không rõ"
    }));

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu chi tiết theo ngày:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// API thống kê sản phẩm bán chạy, sắp hết, tồn kho nhiều 
router.get('/dashboard/product/statistics', adminAuth, async (req, res) => {
  try {
    // Sản phẩm sắp hết hàng (tồn kho dưới 10)
    const [lowStock] = await pool.query(`
      SELECT 
        id, 
        name, 
        images, 
        inventory_quantity 
      FROM 
        product 
      WHERE 
        inventory_quantity < 10
    `);

    // Sản phẩm tồn kho nhiều nhưng bán chậm
    const [slowMovingProducts] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.images,
        p.inventory_quantity, 
        p.create_date,
        IFNULL(SUM(od.quantity), 0) AS total_sold
    FROM 
        product p
    LEFT JOIN 
        order_detail od ON p.id = od.pr_id
    WHERE 
        p.inventory_quantity > 50
        AND p.create_date <= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
    GROUP BY 
        p.id, p.name, p.inventory_quantity, p.images, p.create_date
    HAVING 
        total_sold < 10
    `);

    // Sản phẩm bán chạy: tổng đã bán nhiều nhất
    const [bestSellingProducts] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.images,
        IFNULL(SUM(od.quantity), 0) AS total_sold
      FROM 
        product p
      LEFT JOIN 
        order_detail od ON p.id = od.pr_id
      GROUP BY 
        p.id, p.name, p.images
      ORDER BY 
        total_sold DESC
      
    `);


    res.json({
      lowStock,
      slowMovingProducts,
      bestSellingProducts
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API Level
router.get('/level', adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT * FROM level ORDER BY total_buy DESC`);
    res.json(result)
  } catch (error) {
    console.error("Lỗi laays level:", error);
  }
})

router.post('/level', adminAuth, async (req, res) => {
  const { rank, total_buy, discount_value } = req.body;

  try {
    const [result] = await pool.query(`INSERT INTO level (rank, total_buy, discount_value) VALUES (?, ?, ?)`, [rank, total_buy, discount_value]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Thêm bậc thành công' });
    } else {
      res.status(400).json({ message: 'Không thể thêm bậc' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm bậc', error: error.message });
  }

})

router.get('/level/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`SELECT * FROM level WHERE id = ?`, [id]);
    res.json(result[0])
  } catch (error) {
    console.error("Lỗi laays level:", error);
  }
})

router.put('/level/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { rank, total_buy, discount_value } = req.body;
  try {
    await pool.query(`UPDATE level SET rank = ?, total_buy = ?, discount_value = ? WHERE id = ? `, [rank, total_buy, discount_value, id]);
    res.json('Cập nhật bậc thành công')
  } catch (error) {
    res.status(500).json({ message: 'Lỗi sửa bậc', error: error.message });
  }
})

router.delete('/level/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM level WHERE id = ? `, [id])
    if (result.affectedRows > 0) {
      res.json('Xóa bậc thành công')
    } else {
      res.json('Xóa bậc thất bại')
    }
  } catch (error) {
    res.json('Xóa bậc thất bại', error)
  }
})






module.exports = router;
