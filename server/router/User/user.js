var express = require('express');
var router = express.Router();
var pool = require('../../database/db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nguyentruongvuong11@gmail.com',
        pass: 'dubg blqu sruj xtbs'  
    }
});

router.get('/user/:id', async (req , res) =>{
    const id = req.params.id;

    try{
        let sql = `SELECT * FROM user WHERE id =? `;
        const [user] = await pool.query(sql, [id]);
        res.json(user[0]);
    }
    catch(error){
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
  
})


// Lấy danh sách dơn hàng của người dùng
router.get('/order_user/:id', async(req, res) =>{
    let id = req.params.id;

    try{
        const sql = `SELECT * FROM \`order\` WHERE user_id = ?`;
        const [result] = await pool.query(sql, [id]);
        res.json(result);
    }

    catch(error){
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
})

// Lấy đơn hàng chi tiết
router.get('/orderdetail_user/:order_id', async (req, res) => {
    const order_id = req.params.order_id;

    try {
        const sql = `
            SELECT 
                od.*, 
                o.name AS order_name, 
                o.phone AS order_phone, 
                o.address AS order_address, 
                o.note AS order_note 
            FROM order_detail od 
            JOIN \`order\` o ON od.order_id = o.id 
            WHERE od.order_id = ?
        `;

        const [result] = await pool.query(sql, [order_id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy chi tiết đơn hàng" });
        }

        res.json(result);
    } catch (error) {
        console.error("Lỗi truy vấn:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});


router.post('/request-otp', async (req, res) => {

    const  {email} = req.body;
    const [row] = await pool.query(`SELECT * FROM user WHERE email = ?`, [email]);

    if(row.length === 0){
        return res.status(404).json({message: "Email không tồn tại"});
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 phút

    await pool.query(`INSERT INTO otp_codes (email, otp_code, expires_at) VALUES(?, ?, ?) `, [email, otp, expiresAt]);

    const mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: 'Mã xác thực OTP - Green Tree Shop',
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 3 phút.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Gửi email thất bại!' });
        }
        res.json({ message: 'OTP đã được gửi đến email của bạn.' });
    });

})

router.post('/verify-otp', async (req,res) =>{
    const {email, otp} = req.body;
    const [row] = await pool.query(`SELECT * FROM otp_codes WHERE email = ? AND otp_code = ?`, [email, otp]);
    if(row.length === 0){
        return res.status(400).json({message: "Mã OTP không hợp lệ hoặc đã hết hạn!"});
    }

    const expiresAt = new Date(row[0].expires_at);
    if(expiresAt < new Date()){
        return res.status(400).json({message: "Mã OTP đã hết hạn!"});
    }

    await pool.query(`DELETE FROM otp_codes WHERE email = ?`, [email]);
    res.json({message: "Xác thực thành công!"});


})


router.post('/reset_pass', async (req, res) =>{
    const {email, newpass} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newpass, saltRounds);
        await pool.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, email]);
        return res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        return res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu!' });
    }

})


module.exports = router;
