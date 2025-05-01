var express = require("express");
var router = express.Router();
var pool = require("../../database/db");
const upload = require("../../multerConfig");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
require("dotenv").config();
const baseUrl = process.env.BASE_URL;
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyentruongvuong11@gmail.com",
    pass: "dubg blqu sruj xtbs",
  },
});

router.get("/user/:id", async (req, res) => {
  const id = req.params.id;

  try {
    let sql = `SELECT * FROM user WHERE id =? `;
    const [user] = await pool.query(sql, [id]);
    res.json(user[0]);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy danh sách dơn hàng của người dùng
router.get("/order_user/:id", async (req, res) => {
  let id = req.params.id;
  const { page = 1, limit = 5 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  if (
    isNaN(pageNumber) ||
    isNaN(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    return res.status(400).json({ message: "Tham số phân trang không hợp lệ" });
  }

  const offset = (pageNumber - 1) * limitNumber;

  try {
    const sql = `SELECT * FROM \`order\` WHERE user_id = ? ORDER BY create_at DESC LIMIT ? OFFSET ?`;
    const [orders] = await pool.query(sql, [id, limitNumber, offset]);

    const [[totalResult]] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`order\` WHERE user_id = ?`,
      [id]
    );

    res.json({
      orders,
      total: totalResult.total,
      page: pageNumber,
      totalPages: Math.ceil(totalResult.total / limitNumber),
      limit: limitNumber,
    });
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy đơn hàng chi tiết
router.get("/orderdetail_user/:order_id", async (req, res) => {
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

// Lấy sản phẩm của order_detail để đánh giá
router.get("/orderdetail_pr/:order_id", async (req, res) => {
  const { order_id } = req.params;
  try {
    const [Products] = await pool.query(
      `SELECT p.* FROM order_detail od JOIN product p ON od.pr_id = p.id WHERE od.order_id =?`,
      [order_id]
    );
    res.json(Products);
  } catch (error) {
    console.error("Lỗi truy vấn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const [row] = await pool.query(`SELECT * FROM user WHERE email = ?`, [email]);

  if (row.length === 0) {
    return res.status(404).json({ message: "Email không tồn tại" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 phút

  await pool.query(
    `INSERT INTO otp_codes (email, otp_code, expires_at) VALUES(?, ?, ?) `,
    [email, otp, expiresAt]
  );

  const mailOptions = {
    from: "youremail@gmail.com",
    to: email,
    subject: "Mã xác thực OTP - Green Tree Shop",
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 3 phút.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Gửi email thất bại!" });
    }
    res.json({ message: "OTP đã được gửi đến email của bạn." });
  });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const [row] = await pool.query(
    `SELECT * FROM otp_codes WHERE email = ? AND otp_code = ?`,
    [email, otp]
  );
  if (row.length === 0) {
    return res
      .status(400)
      .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });
  }

  const expiresAt = new Date(row[0].expires_at);
  if (expiresAt < new Date()) {
    return res.status(400).json({ message: "Mã OTP đã hết hạn!" });
  }

  await pool.query(`DELETE FROM otp_codes WHERE email = ?`, [email]);
  res.json({ message: "Xác thực thành công!" });
});

router.post("/reset_pass", async (req, res) => {
  const { email, newpass } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newpass, saltRounds);
    await pool.query("UPDATE user SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);
    return res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
  }
});

// Cập nhật thông tài khoản
router.put(`/update/:user_id`, async (req, res) => {
  const { user_id } = req.params;
  const { username, phone, address } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE user SET username = ?,phone = ?, address = ? WHERE id = ? `,
      [username, phone, address, user_id]
    );
    if (result.affectedRows > 0) {
      const [rows] = await pool.query(
        `SELECT username, phone, address FROM user WHERE id = ?`,
        [user_id]
      );
      res.json({
        message: "Cập nhật thành công",
        user: rows[0],
      });
    } else {
      res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để cập nhật" });
    }
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật avatar
router.post(
    "/upload-avatar/:user_id",
    upload.single("avatar"),
    async (req, res) => {
      try {
        const { user_id } = req.params;
        const file = req.file;
  
        if (!file) {
          return res.status(400).json({ message: "Không có file được tải lên." });
        }
  
        // Lấy thông tin người dùng từ DB
        const [user] = await pool.query(`SELECT avatar FROM user WHERE id = ?`, [user_id]);
        const oldAvatar = user[0]?.avatar;
  
        if (oldAvatar && oldAvatar !== '/images/user_circle.webp') {  // Kiểm tra để tránh xóa ảnh mặc định
          const avatarPath = oldAvatar.replace(`${baseUrl}/public/images/`, '');  // Lấy tên file từ URL
          const pathOldAvatar = path.join(__dirname, '../../public/images', avatarPath);
  
          // Kiểm tra và xóa ảnh cũ nếu tồn tại
          try {
            if (fs.existsSync(pathOldAvatar)) {
              await fs.promises.unlink(pathOldAvatar);  // Xóa ảnh cũ
              console.log('Đã xóa ảnh cũ:', pathOldAvatar);
            }
          } catch (err) {
            console.error("Lỗi khi xóa ảnh cũ:", err);  // Thông báo lỗi nếu có vấn đề
          }
        }
  
        const avatarPathNew = `${baseUrl}/public/images/${file.filename}`;  // Lưu đường dẫn ảnh mới
  
        // Cập nhật thông tin avatar mới vào DB
        const [result] = await pool.query(
          `UPDATE user SET avatar = ? WHERE id = ?`,
          [avatarPathNew, user_id]
        );
  
        if (result.affectedRows > 0) {
          return res.json({
            message: "Cập nhật avatar thành công",
            avatar: avatarPathNew,
          });
        } else {
          return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
      } catch (error) {
        console.error("Lỗi cập nhật avatar:", error);
        res.status(500).json({ message: "Lỗi server" });
      }
    }
  );

// Lấy rank của user
router.get('/rank/:user_id', async (req, res) =>{
  const {user_id} = req.params;
  try{
    const [result] = await pool.query(`SELECT l.rank, l.discount_value FROM user u JOIN level l ON u.total_buy >= l.total_buy WHERE u.id = ? ORDER BY l.total_buy DESC LIMIT 1`, [user_id]);
    res.json(result)
  } catch(error){
    res.json('Lỗi lấy rank của user', error)
  }
})

module.exports = router;
