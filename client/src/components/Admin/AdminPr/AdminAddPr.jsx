import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../../../styles/Admin/formaddsp.css";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
const FormThemSanPham = () => {
  const [cates, setCates] = useState([]);
  const [characteristic, setCharacteristic] = useState([]);
  const [typeCates, setTypeCates] = useState([]);
  const [selectedTypeCates, setSelectedTypeCates] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [priceSale, setPriceSale] = useState(0);
  const token = useSelector((state) => state.auth.token);

  //   Upload ảnh
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("images", file));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/adminpr/upload`,
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newUrls = res.data.urls; // danh sách ảnh mới
      const currentImages = formData.images ? formData.images.split(",") : [];

      // Gộp ảnh cũ với ảnh mới
      const allImages = [...currentImages, ...newUrls];
      const allImagesStr = allImages.join(",");

      setFormData((prev) => ({
        ...prev,
        images: allImagesStr,
      }));

      // Cập nhật ảnh để preview
      setImageFiles(allImages);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Lỗi upload ảnh");
    }
  };
  //  Xóa ảnh đã chọn
  const removeImage = async (index) => {
    const imageToRemove = imageFiles[index];

    try {
      // Gọi API xóa ảnh trên server
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/adminpr/delete-image`,
        {
          data: { imageUrl: imageToRemove },
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      // Nếu xóa thành công trên server thì xóa ở frontend
      const newImageFiles = imageFiles.filter((_, i) => i !== index);

      setImageFiles(newImageFiles);
      setFormData((prev) => ({
        ...prev,
        images: newImageFiles.join(","),
      }));
      message.success("Xóa ảnh thành công");
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      alert("Không thể xóa ảnh");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    sale: 0,
    cate_id: "",
    characteristic_id: "",
    images: "",
    inventory_quantity: 0,
    description: "",
  });

  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const sale = parseFloat(formData.sale) || 0;

    if (sale === 0) {
      setPriceSale(0);
    } else {
      const calculated = price - (price * sale) / 100;
      const finalPrice = calculated > 0 ? parseFloat(calculated.toFixed(0)) : 0;
      setPriceSale(finalPrice);
    }
  }, [formData.price, formData.sale]);

  // Lấy danh sách cate
  useEffect(() => {
    const otp = {
      headers: {
        "Content-Type": "aplication/json",
        Authorization: "Bearer " + token,
      },
    };
    axios
      .get(`${import.meta.env.VITE_API_URL}/adminc/cate`, otp)
      .then((res) => {
        setCates(res.data);
      });
  }, [token]);

  // Khi chọn cate, lấy characteristic
  useEffect(() => {
    if (formData.cate_id) {
      const otp = {
        headers: {
          "Content-Type": "aplication/json",
          Authorization: "Bearer " + token,
        },
      };
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/adminc/characteristic/${
            formData.cate_id
          }`,
          otp
        )
        .then((res) => setCharacteristic(res.data))
        .catch((err) => console.error(err));
    }
  }, [formData.cate_id, token]);

  // Lấy type_cate theo characteristic được chọn
  useEffect(() => {
    if (formData.characteristic_id) {
      const otp = {
        headers: {
          "Content-Type": "aplication/json",
          Authorization: "Bearer " + token,
        },
      };
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/adminc/type_cates/${
            formData.characteristic_id
          }`,
          otp
        )
        .then((res) => setTypeCates(res.data))
        .catch((err) => console.error(err));
    } else {
      setTypeCates([]); // nếu chưa chọn đặc điểm, xóa hết type_cates
    }
  }, [formData.characteristic_id, token]);

  const handleTypeCateChange = (id) => {
    setSelectedTypeCates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;

    if (!formData.name.trim()) {
      message.error("Vui lòng nhập tên sản phẩm");
      isValid = false;
    }

    if (formData.price <= 0) {
      message.error("Giá sản phẩm phải lớn hơn 0");
      isValid = false;
    }

    if (formData.cate_id === "") {
      message.error("Vui lòng chọn danh mục");
      isValid = false;
    }

    if (formData.characteristic_id === "") {
      message.error("Vui lòng chọn đặc điểm");
      isValid = false;
    }

    if (selectedTypeCates.length === 0) {
      message.error("Vui lòng chọn loại cây");
      isValid = false;
    }

    if (imageFiles.length === 0) {
      message.error("Vui lòng chọn ít nhất một ảnh");
      isValid = false;
    }

    if (formData.inventory_quantity < 0) {
      message.error("Số lượng tồn kho không hợp lệ");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      type_cate_ids: selectedTypeCates,
      price_sale: priceSale,
    };

    axios
      .post(`${import.meta.env.VITE_API_URL}/adminpr/products`, payload)
      .then(() => {
        alert("Tạo sản phẩm thành công!");
        // Reset form
        setFormData({
          name: "",
          price: 0,
          sale: 0,
          cate_id: "",
          images: "",
          inventory_quantity: 0,
          description: "",
        });
        setSelectedTypeCates([]);
        setTypeCates([]);
        setCharacteristic(null);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        alert("Lỗi khi tạo sản phẩm");
      });
  };

  return (
    <div className="form-wrapper">
      <h2>Thêm sản phẩm</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên sản phẩm:</label>
          <input
            className="form-control"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Giá:</label>
          <input
            className="form-control"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Giảm giá (%):</label>
          <input
            className="form-control"
            type="number"
            name="sale"
            value={formData.sale}
            onChange={handleInputChange}
            min={0}
            max={100}
            required
          />
        </div>

        <div className="form-group">
          <label>Giá đã giảm:</label>
          <input
            className="form-control"
            type="number"
            name="price_sale"
            value={priceSale}
            readOnly
            required
          />
        </div>

        <div className="form-group">
          <label>Danh mục:</label>
          <select
            className="form-control"
            name="cate_id"
            value={formData.cate_id}
            onChange={handleInputChange}
          >
            <option value="">-- Chọn danh mục --</option>
            {cates.map((cate) => (
              <option key={cate.id} value={cate.id}>
                {cate.name}
              </option>
            ))}
          </select>
        </div>

        {characteristic.length > 0 && (
          <div className="form-group">
            <label>Đặc điểm:</label>
            <select
              className="form-control"
              name="characteristic_id"
              value={formData.characteristic_id}
              onChange={handleInputChange}
              disabled={!formData.cate_id}
            >
              <option value="">-- Chọn đặc điểm --</option>
              {characteristic.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {typeCates.length > 0 && (
          <div className="form-group checkbox-group">
            <label>Loại:</label>
            <br />
            {typeCates.map((type) => (
              <label key={type.id}>
                <input
                  type="checkbox"
                  checked={selectedTypeCates.includes(type.id)}
                  onChange={() => handleTypeCateChange(type.id)}
                />{" "}
                {type.name}
              </label>
            ))}
          </div>
        )}

        <div className="form-group">
          <label>Ảnh sản phẩm:</label>
          <input
            className="form-control"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e)}
          />
        </div>

        {imageFiles.map((url, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              display: "inline-block",
              margin: "5px",
            }}
          >
            <img
              src={url}
              alt={`ảnh-${index}`}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              ×
            </button>
          </div>
        ))}

        <div className="form-group">
          <label>Số lượng tồn kho:</label>
          <input
            className="form-control"
            type="number"
            name="inventory_quantity"
            value={formData.inventory_quantity}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Mô tả:</label>
          <textarea
            className="form-control form-textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <button className="submit-btn" type="submit">
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default FormThemSanPham;
