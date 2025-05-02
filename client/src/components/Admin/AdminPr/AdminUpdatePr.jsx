import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";

export default function UpdatePr({ id }) {
  const token = useSelector((state) => state.auth.token);
  const [priceSale, setPriceSale] = useState(0);
  const [imageFiles, setImageFiles] = useState([]);
  const [updatePr, setUpdatePr] = useState({
    name: "",
    price: 0,
    sale: 0,
    price_sale: 0,
    discription: "",
    inventory_quantity: 0,
    view: 0,
    status: 1,
    images: ""
  });

  // Tính toán giá sau khi giảm giá
  useEffect(() => {
    const price = parseFloat(updatePr.price) || 0;
    const sale = parseFloat(updatePr.sale) || 0;

    if (sale === 0) {
      setPriceSale(0);
    } else {
      const calculated = price - (price * sale) / 100;
      const finalPrice = calculated > 0 ? parseFloat(calculated.toFixed(0)) : 0;
      setPriceSale(finalPrice);
    }
  }, [updatePr.price, updatePr.sale]);

  // Lấy thông tin sản phẩm khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/adminpr/products/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = response.data;
        console.log(data.status)
        setUpdatePr({
          name: data.name || "",
          images: data.images || "",
          price: data.price || 0,
          sale: data.sale || 0,
          price_sale: data.price_sale || 0,
          discription: data.discription || "",
          inventory_quantity: data.inventory_quantity || 0,
          view: data.view || 0,
          status: data.status ?? 1,
        });

        if (data.images) {
          setImageFiles(data.images.split(",").filter(url => url.trim() !== ""));
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        message.error("Không thể lấy thông tin sản phẩm");
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [token, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatePr((prev) => ({
      ...prev,
      [name]: value,
    }));
  };  

  const validateForm = () => {
    let isValid = true;

    if (!updatePr.name.trim()) {
      message.error("Vui lòng nhập tên sản phẩm");
      isValid = false;
    }

    if (updatePr.price <= 0) {
      message.error("Giá sản phẩm phải lớn hơn 0");
      isValid = false;
    }

    if (imageFiles.length === 0) {
      message.error("Vui lòng chọn ít nhất một ảnh");
      isValid = false;
    }

    if (updatePr.inventory_quantity < 0) {
      message.error("Số lượng tồn kho không hợp lệ");
      isValid = false;
    }

    return isValid;
  };

  // Xử lý upload ảnh mới
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append("images", file));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/adminpr/upload`,
        formDataUpload,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + token
          },
        }
      );

      const newUrls = res.data.urls;
      const currentImages = updatePr.images ? updatePr.images.split(",").filter(url => url.trim() !== "") : [];

      // Gộp ảnh cũ với ảnh mới
      const allImages = [...currentImages, ...newUrls];
      const allImagesStr = allImages.join(",");

      setUpdatePr((prev) => ({
        ...prev,
        images: allImagesStr,
      }));

      // Cập nhật ảnh để preview
      setImageFiles(allImages);
      message.success("Upload ảnh thành công");
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      message.error("Lỗi upload ảnh");
    }
  };

  // Xóa ảnh (cả trên server và client)
  const removeImage = async (index) => {
    const imageToRemove = imageFiles[index];
    
    try {
      // Gọi API xóa ảnh trên server
      await axios.delete(`${import.meta.env.VITE_API_URL}/adminpr/delete-image`, {
        data: { imageUrl: imageToRemove },
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token 
        }
      });

      // Nếu xóa thành công trên server thì xóa ở frontend
      const newImageFiles = imageFiles.filter((_, i) => i !== index);
      
      setImageFiles(newImageFiles);
      setUpdatePr((prev) => ({
        ...prev,
        images: newImageFiles.join(","),
      }));

      message.success("Xóa ảnh thành công");
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      message.error("Không thể xóa ảnh");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/adminpr/products/${id}`,
        {
          ...updatePr,
          price_sale: priceSale,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.data) {
        message.success(response.data.message || "Cập nhật sản phẩm thành công");
        setTimeout(() =>{
          window.location.reload()

        }, 1000)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      message.error(error.response?.data?.error || "Lỗi khi cập nhật sản phẩm");
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Cập nhật sản phẩm</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên sản phẩm:</label>
          <input
            className="form-control"
            type="text"
            name="name"
            value={updatePr.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Giá:</label>
          <input
            className="form-control"
            type="number"
            name="price"
            value={updatePr.price}
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
            value={updatePr.sale}
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
          <label>Ảnh sản phẩm:</label>
          <input
            className="form-control"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "10px 0" }}>
          {imageFiles.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img 
                src={url} 
                alt={`Ảnh ${index}`} 
                style={{ 
                  width: "100px", 
                  height: "100px", 
                  objectFit: "cover",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }} 
              />
              <button
                type="button"
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
                  fontSize: "12px"
                }}
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Mô tả:</label>
          <textarea
            className="form-control form-textarea"
            name="discription"
            value={updatePr.discription}
            onChange={handleInputChange}
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>Số lượng tồn kho:</label>
          <input
            className="form-control"
            type="number"
            name="inventory_quantity"
            value={updatePr.inventory_quantity}
            onChange={handleInputChange}
            min={0}
            required
          />
        </div>

        <div className="form-group">
          <label>Lượt xem:</label>
          <input
            className="form-control"
            type="number"
            name="view"
            value={updatePr.view}
            onChange={handleInputChange}
            min={0}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Trạng thái:</label>
          <select
            className="form-control"
            name="status"
            value={updatePr.status}
            onChange={handleInputChange}
            required
          >
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>

        <button className="submit-btn" type="submit">
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
}