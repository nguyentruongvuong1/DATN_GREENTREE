require('dotenv').config();
var express = require('express');
var router = express.Router();
var pool = require('../../database/db'); // Đảm bảo đã sử dụng mysql2/promise
var upload = require('../../multerConfig');
const path = require('path');
const fs = require('fs');
const baseUrl = process.env.BASE_URL; // Lấy từ .env
const {adminAuth} = require('../auth')

// up nhiều sản phẩm
router.post('/upload', upload.array('images', 10), (req, res) => {
  const urls = req.files.map(file => `${baseUrl}/public/images/${file.filename}`);
  res.json({ urls });
});

router.get("/products", async (req, res) => {
  const { sort, page = 1, limit = 8 } = req.query;

  let orderBy = "p.create_date DESC";
  if (sort === "price_asc") orderBy = "p.price ASC";
  else if (sort === "price_desc") orderBy = "p.price DESC";
  else if (sort === "view") orderBy = "p.view DESC";

  // Validate input
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
    return res.status(400).json({ message: "Tham số phân trang không hợp lệ" });
  }

  const offset = (pageNumber - 1) * limitNumber;

  try {
    const [products] = await pool.query(`
            SELECT p.*, c.name AS category_name
            FROM product p
            LEFT JOIN cate c ON p.cate_id = c.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limitNumber, offset]);

    const [[totalResult]] = await pool.query(`
            SELECT COUNT(*) as total FROM product
        `);

    res.json({
      products,
      total: totalResult.total,
      page: pageNumber,
      totalPages: Math.ceil(totalResult.total / limitNumber),
      limit: limitNumber
    });

  } catch (err) {
    console.error("Lỗi lấy sản phẩm:", err);
    res.status(500).json({ message: "Lỗi lấy sản phẩm", error: err.message });
  }
});

//Lấy đặc điểm và loại cây
router.get('/product_type_cate', async (req, res) => {

})

// API thêm sản phẩm
router.post('/products', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      name, price, sale, price_sale, cate_id, images, type_cate_ids, inventory_quantity, description
    } = req.body;
    console.log(req.body);
    // 1. Thêm vào bảng product
    const [result] = await conn.query(`
        INSERT INTO product (name, price, sale, price_sale, cate_id, images, inventory_quantity, discription, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [name, price, sale, price_sale, cate_id, images, inventory_quantity, description]);

    const productId = result.insertId;

    // 2. Thêm vào bảng product_type_cate
    for (const typeId of type_cate_ids) {
      await conn.query(`
          INSERT INTO product_type_cate (pr_id, type_cate_id)
          VALUES (?, ?)
        `, [productId, typeId]);
    }

    res.status(201).json({ message: 'Success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});
// API xóa ảnh
router.delete('/delete-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Thiếu URL ảnh' });
    }

    // Lấy tên file từ URL (phần sau cùng sau dấu /)
    const filename = imageUrl.split('/').pop();
    const imagePath = path.join(__dirname, '../../public/images', filename);

    // Kiểm tra file tồn tại trước khi xóa
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Xóa file vật lý
      return res.json({ success: true, message: 'Xóa ảnh thành công' });
    } else {
      return res.status(404).json({ error: 'Ảnh không tồn tại' });
    }
  } catch (err) {
    console.error('Lỗi khi xóa ảnh:', err);
    res.status(500).json({ error: 'Lỗi server khi xóa ảnh' });
  }
});

// API xóa sản phẩm
router.delete('/product/:id', async (req, res) => {
  const conn = await pool.getConnection();
  const { id } = req.params;
  const sql = "DELETE FROM product WHERE id = ?";

  try {
    // Lấy thông tin ảnh của sản phẩm
    const [rows] = await conn.query("SELECT images FROM product WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const images = rows[0].images ? rows[0].images.split(',') : [];

    // Xóa các ảnh trên server
    images.forEach(imageurl => {
      const imageName = imageurl.split('/').pop(); // Tên file
      const filePath = path.join(__dirname, '../../public/images', imageName); // Đúng đường dẫn

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Lỗi xóa ảnh:", err);
        } else {
          console.log("Đã xóa ảnh:", imageName);
        }
      });
    });

    // Xóa bản ghi liên quan
    await conn.query('DELETE FROM product_type_cate WHERE pr_id = ?', [id]);
    await conn.query(sql, [id]);

    res.json({ message: "Xóa sản phẩm thành công!" });

  } catch (err) {
    console.error("Lỗi xóa sản phẩm:", err);
    return res.status(500).json({ message: "Lỗi server", error: err });
  } finally {
    conn.release();
  }
});


router.get(`/products/:id`, adminAuth, async (req,res) =>{
  const {id} = req.params;
  try{
    const [result] = await pool.query(`SELECT * FROM product WHERE id = ?`, [id]);
    res.json(result[0])

  }catch(error){
    res.json('Lỗi khi lấy sản phẩm', error)
  }
})

router.put('/products/:id', adminAuth, upload.array('newImages', 10), async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      name,
      price,
      sale,
      price_sale,
      discription,
      inventory_quantity,
      view,
      status,
      images // ảnh mới từ client (đã xoá bớt ảnh cũ nào không cần)
    } = req.body;

    // 1. Lấy danh sách ảnh cũ từ DB
    const [rows] = await pool.query('SELECT images FROM product WHERE id = ?', [productId]);
    const oldImages = rows[0]?.images ? rows[0].images.split(',') : [];

    // 2. Tạo mảng ảnh còn giữ lại (từ client gửi lên)
    const updatedImages = images ? images.split(',') : [];

    // 3. Xoá ảnh nào không còn giữ lại
    const imagesToDelete = oldImages.filter(oldImg => !updatedImages.includes(oldImg));

    imagesToDelete.forEach(imgUrl => {
      const fileName = imgUrl.split('/').pop(); // lấy tên file
      const filePath = path.join(__dirname, '../../public/images', fileName);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Không thể xoá ảnh ${fileName}:`, err.message);
        else console.log(`Đã xoá ảnh: ${fileName}`);
      });
    });

    // 4. Thêm ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `${baseUrl}/public/images/${file.filename}`);
      updatedImages.push(...newImageUrls);
    }

    // 5. Cập nhật lại DB
    const sql = `
      UPDATE product
      SET name = ?, price = ?, sale = ?, price_sale = ?, discription = ?,
          inventory_quantity = ?, view = ?, status = ?, images = ?
      WHERE id = ?
    `;

    const values = [
      name,
      price,
      sale,
      price_sale,
      discription,
      inventory_quantity,
      view,
      status,
      updatedImages.join(','),
      productId
    ];

    await pool.query(sql, values);

    res.json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật sản phẩm:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm' });
  }
});


module.exports = router;
