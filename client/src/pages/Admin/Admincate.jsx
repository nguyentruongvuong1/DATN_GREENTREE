import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { FaArrowRight } from "react-icons/fa"; // Import icon mũi tên
import moment from "moment"; // Import thư viện moment.js để định dạng ngày tháng
import "../../styles/Admin/styleadmin.css";
import { useSelector } from "react-redux";

const Admincate = () => {
  const [cate, setcates] = useState([]);
  const [editcate, setEditcate] = useState(null); // Lưu cate đang chỉnh sửa
  const [showAddForm, setShowAddForm] = useState(false); // Ẩn/hiện form
  const token = useSelector((state) => state.auth.token)
  const [newcate, setNewcate] = useState({
    name: "",
    content: "",
    status: "1",
    image: null,
    image_content: null
  });

  const [search, setsearch] = useState(''); // Trạng thái tìm kiếm
  const [allCt, setallCt] = useState([]); // Tất cả cate để tìm kiếm
  const [ctfilter, ganctfilter] = useState([]) // Trạng thái tìm kiếm
  const [viewCate, setViewCate] = useState(null);

  const user = useSelector((state) => state.auth.user)


  useEffect(() => {
    const otp = {
      headers: {
        "Content-Type": 'multipart/form-data',
        'Authorization': 'Bearer ' + token
      }
    }
    axios.get(`${import.meta.env.VITE_API_URL}/adminc/cate`, otp)
      .then((response) => {
        setcates(response.data);
        setallCt(response.data); // gán allCt với dữ liệu cate
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu:", error);
      });
  }, []);

  const onchangeSearch = (e) => {
    setsearch(e.target.value)
  }

  useEffect(() => {
    if (search === '') {
      ganctfilter(cate)
    } else {
      const FilterCt = allCt.filter(ct => ct.name.toLowerCase().includes(search.toLowerCase()))
      ganctfilter(FilterCt)
    }

  }, [search, allCt, cate])

  const fetchcates = async () => {
    try {
      const otp = {
        headers: {
          "Content-Type": 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        }
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/cate`, otp);
      setcates(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cate này không?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/adminc/cate/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        }

      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        alert("Xóa thành công!");
        fetchcates(); // Load lại danh sách
      } else {
        console.error("Lỗi xóa danh mục:", data);
        const errorMessage = data.message || "Thêm thất bại, dữ liệu không hợp lệ.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi xóa cate:", error);
    }
  };

  const handleNewcateChange = (e) => {
    const { name, value } = e.target;
    setNewcate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleAddcate = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu trước khi gửi
    if (!newcate.name.trim() || !newcate.content.trim()) {
      alert("Vui lòng điền đầy đủ thông tin cần thiết");
      return;
    }

    if (!newcate.image || !newcate.image_content) {
      alert("Vui lòng chọn đầy đủ ảnh và ảnh nội dung.");
      return;
    }
    const formData = new FormData();
    formData.append("name", newcate.name);
    formData.append("content", newcate.content);
    formData.append("status", newcate.status);
    if (newcate.image) formData.append("image", newcate.image);
    if (newcate.image_content) formData.append("image_content", newcate.image_content);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/adminc/cate`, {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert("Thêm danh mục thành công!");
        setNewcate({
          name: "",
          content: "",
          status: "1",
          image: null,
          image_content: null,
        });
        fetchcates();
        setShowAddForm(false);
      } else {
        console.error("Lỗi cập nhật:", data);
        const message = data.message || "Cập nhật thất bại";
        alert(message);
        return;
      }
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
    }
  };


  // Hàm mở form sửa
  const handleEdit = (cate) => {
    setEditcate(cate);
  };

  // Hàm cập nhật dữ liệu khi nhập vào form
  const handleChange = (e) => {
    setEditcate({ ...editcate, [e.target.name]: e.target.value });
  };

  // Hàm lưu dữ liệu sau khi chỉnh sửa
  const handleSave = async (e) => {
    e.preventDefault();

    //  Kiểm tra dữ liệu trước khi gửi
    if (!editcate.name.trim() || !editcate.content.trim()) {
      alert("Vui lòng điền đầy đủ thông tin cần thiết");
      return;
    }


    try {
      const formData = new FormData();
      formData.append("name", editcate.name);
      formData.append("content", editcate.content);
      formData.append("status", editcate.status);

      if (editcate.newImage) {
        formData.append("image", editcate.newImage);
      }

      if (editcate.newImageContent) {
        formData.append("image_content", editcate.newImageContent);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/adminc/cate/${editcate.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + token
        }

      });

      const data = await response.json(); //thông báo trả về từ server về trùng name danh mục
      if (!response.ok) {
        console.error("Lỗi cập nhật:", data);
        const message = data.message || "Cập nhật thất bại";
        alert(message);
        return;
      }


      alert("Cập nhật thành công!");
      fetchcates();
      setEditcate(null);

    } catch (error) {
      console.error("Lỗi khi cập nhật cate:", error);
      alert("Đã có lỗi xảy ra khi cập nhật danh mục.");
    }
  };

  const handleView = async (cate) => {
    try {
      const otp = {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      };

      const charRes = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/characteristic/${cate.id}`, otp);

      const characteristicsWithTypecates = [];

      for (const char of charRes.data) {
        const typeRes = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/type_cates/${char.id}`, otp);

        characteristicsWithTypecates.push({
          ...char,
          typecates: typeRes.data, // Gắn thêm typecates vào từng characteristic
        });
      }

      setViewCate({
        ...cate,
        characteristics: characteristicsWithTypecates, // chú ý đổi key
      });

    } catch (error) {
      console.error("Lỗi khi lấy chi tiết danh mục:", error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
    }
  };

  return (

    <div className="main">

      <div className="topbar">
        <div className="toggle">
        </div>
        <div className="search">
          <label>
            <input
              type="text"
              value={search}
              onChange={onchangeSearch} placeholder="Tìm kiếm..."

            />
          </label>
        </div>

        <div className="user">
          <img src={user.avatar} alt="User" />
        </div>
      </div>

      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Quản Lý Danh Mục</h2>
            <button className="buttonAdd" onClick={() => setShowAddForm(true)}>Thêm Danh Mục</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên Danh Mục</th>
                <th>Nội dung</th>
                <th>Ảnh nội dung</th>
                <th>Ngày Tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {ctfilter.map((cate) => (
                <tr key={cate.id}>
                  <td>{cate.id}</td>
                  <td><img style={{ width: '50px', height: '50px' }} src={
                    cate.image &&
                      cate.image.startsWith("../../public/images")
                      ? `${import.meta.env.VITE_API_URL}/${cate.image}`
                      : cate.image
                  } alt="" /></td>
                  <td>{cate.name}</td>
                  <td width={'250px'}>{cate.content.length > 30 ? cate.content.slice(0, 30) + '...' : cate.content}</td>
                  <td><img style={{ width: '50px', height: '50px' }} src={
                    cate.image_content &&
                      cate.image_content.startsWith("../../public/images")
                      ? `${import.meta.env.VITE_API_URL}/${cate.image_content}`
                      : cate.image_content
                  }
                    alt="" /></td>
                  <td>{moment(cate.create_date).format('DD-MM-YYYY')}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(cate)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(cate.id)}>Xóa</button>
                    <button className="btn-detail" onClick={() => handleView(cate)}>Xem</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Form chỉnh sửa cate */}
          {editcate && (
            <>
              <div className="modal-overlay" onClick={() => setEditcate(null)}></div>
              <div className="modal-container">
                <span className="modal-close-btn" onClick={() => setEditcate(null)}>&times;</span>
                <h3>Sửa danh mục</h3>

                <form onSubmit={handleSave} encType="multipart/form-data">
                  <label>Tên danh mục:</label>
                  <input type="text" name="name" value={editcate.name || ""} onChange={handleChange} required />

                  <label>Nội dung:</label>
                  <input type="text" name="content" value={editcate.content || ""} onChange={handleChange} required />

                  <label>Ảnh hiện tại:</label>
                  <img
                    src={
                      editcate.image?.startsWith("../../public/images")
                        ? `${import.meta.env.VITE_API_URL}/${editcate.image}`
                        : editcate.image
                    }
                    alt="Ảnh"
                    width="60"
                  />
                  <input type="file" name="image" accept="image/*" onChange={(e) => setEditcate({ ...editcate, newImage: e.target.files[0] })} />

                  <label>Ảnh nội dung hiện tại:</label>
                  <img
                    src={
                      editcate.image_content?.startsWith("../../public/images")
                        ? `${import.meta.env.VITE_API_URL}/${editcate.image_content}`
                        : editcate.image_content
                    }
                    alt="Ảnh ND"
                    width="60"
                  />
                  <input type="file" name="image_content" accept="image/*" onChange={(e) => setEditcate({ ...editcate, newImageContent: e.target.files[0] })} />

                  <label>Trạng thái:</label>
                  <select name="status" value={editcate.status} onChange={handleChange}>
                    <option value="1">Hiện</option>
                    <option value="0">Ẩn</option>
                  </select>

                  <button type="submit">Lưu</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditcate(null)}>Hủy</button>
                </form>
              </div>
            </>
          )}

          {/* Form thêm cate */}

          {showAddForm && (
            <>
              <div className="modal-overlay" onClick={() => setShowAddForm(false)}></div>
              <div className="modal-container">
                <span className="modal-close-btn" onClick={() => setShowAddForm(false)}>&times;</span>
                <h3>Thêm danh mục</h3>

                <form onSubmit={handleAddcate} encType="multipart/form-data">
                  <label>Tên danh mục:</label>
                  <input type="text" name="name" value={newcate.name} onChange={handleNewcateChange} required />

                  <label>Nội dung:</label>
                  <input type="text" name="content" value={newcate.content} onChange={handleNewcateChange} required />

                  <label>Ảnh:</label>
                  <input type="file" name="image" accept="image/*" onChange={(e) => setNewcate({ ...newcate, image: e.target.files[0] })} />

                  <label>Ảnh nội dung:</label>
                  <input type="file" name="image_content" accept="image/*" onChange={(e) => setNewcate({ ...newcate, image_content: e.target.files[0] })} />

                  <label>Trạng thái:</label>
                  <select name="status" value={newcate.status} onChange={handleNewcateChange}>
                    <option value="1">Hiện</option>
                    <option value="0">Ẩn</option>
                  </select>

                  <button type="submit">Lưu</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Hủy</button>
                </form>

              </div>
            </>
          )}

          {viewCate && (
            <>
              <div className="modal-overlay" onClick={() => setViewCate(null)}></div>
              <div className="modal-container viewcate-modal">
                <span className="modal-close-btn" onClick={() => setViewCate(null)}>&times;</span>
                <h2 className="viewcate-title">Chi tiết danh mục: {viewCate.name}</h2>

                <div className="viewcate-content">
                  {viewCate.characteristics?.map((char) => (
                    <div key={char.id} className="viewcate-section">
                      <h3 className="viewcate-characteristic"> {char.name}</h3>

                      <ul className="viewcate-typecate-list">
                        {char.typecates.length > 0 ? (
                          char.typecates.map((type) => (
                            <li key={type.id} className="viewcate-typecate-item">- {type.name}</li>
                          ))
                        ) : (
                          <li className="viewcate-no-typecate">(Không có loại nào)</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>

                <button className="cancel-btn" onClick={() => setViewCate(null)}>Đóng</button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admincate;
