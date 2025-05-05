import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "../../styles/Admin/styleadmin.css";
import { useSelector } from 'react-redux';
import moment from 'moment'

const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({ status: 1, image: null });
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalBanners, setTotalBanners] = useState(0);

  const [bnfilter, ganbnfilter] = useState([]) // Trạng thái tìm kiếm
  const [allBn, setallBn] = useState([]); // Tất cả banner để tìm kiếm
  const [search, setsearch] = useState(''); // Trạng thái tìm kiếm
  const user = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    fetchBanners();
  }, [currentPage, itemsPerPage, token]);

  const fetchBanners = async () => {
    try {
      const otp = {
        headers: {
          "Content-Type": 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        }
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/banners?page=${currentPage}&limit=${itemsPerPage}`, otp
      );
      setBanners(response.data.banners);
      setTotalBanners(response.data.total);
    } catch (error) {
      console.error("Lỗi khi tải banner:", error);
    }
  };

  useEffect(() => {
    const fetchallBanners = async () => {
      try {
        const otp = {
          headers: {
            "Content-Type": 'multipart/form-data',
            'Authorization': 'Bearer ' + token
          }
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/banners`, otp
        );
        setallBn(response.data.banners); // gán allBn với dữ liệu banner
      } catch (error) {
        console.error("Lỗi khi tải banner:", error);
      }
    };
    fetchallBanners();
  }, [token]);

  useEffect(() => {
    if (search === '') {
      ganbnfilter(banners)
    } else {
      const FilterBn = allBn.filter(bn => String(bn.id).toLowerCase().includes(search.toLowerCase()))
      ganbnfilter(FilterBn)
    }

  }, [search, allBn, banners])

  const onchangeSearch = (e) => {
    setsearch(e.target.value)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này không?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/banner/${id}`);
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {

      const otp = {
        headers: {
          "Content-Type": 'multipart/form-data',
          'Authorization': 'Bearer ' + token
        }
      }

      const form = new FormData();
      form.append("status", formData.status);
      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      // Kiểm tra nếu đang thêm mới mà chưa chọn ảnh
      if (!isEdit && !(formData.image instanceof File)) {
        alert("Vui lòng chọn ảnh banner trước khi thêm!");
        return;
      }

      if (isEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/banner/${formData.id}`,
          form, otp
        );
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/banner`, form, otp);
      }

      fetchBanners();
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi lưu banner:", error);
    }
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          <ion-icon name="menu-outline"></ion-icon>
        </div>
        <div className="search">
          <label>
            <input
              type="text"
              value={search}
              onChange={onchangeSearch} placeholder="Tìm kiếm..."

            />            <ion-icon name="search-outline"></ion-icon>
          </label>
        </div>
        <div className="user">
          <img src={user.avatar} alt="User" />
        </div>
      </div>

      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Quản Lý Banner</h2>
            <button
              className="buttonAdd"
              onClick={() => {
                setShowForm(true);
                setIsEdit(false);
                setFormData({ status: 1, image: null });
              }}
            >
              Thêm Banner
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bnfilter.map((banner) => (
                <tr key={banner.id}>
                  <td>{banner.id}</td>
                  <td>
                    <img
                      src={
                        banner.image
                      }
                      alt="Banner"
                      style={{ width: "120px" }}
                    />
                  </td>
                  <td>{banner.status === 1 ? "Hiển thị" : "Ẩn"}</td>
                  <td>{moment(banner.create_date).format('DD-MM-YYYY')}</td>
                  <td>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setIsEdit(true);
                        setFormData(banner);
                      }}
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(banner.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalBanners > itemsPerPage && (
            <div className="paginationContainer">
              <ReactPaginate
                breakLabel="⋯"
                nextLabel=">"
                previousLabel="<"
                onPageChange={handlePageChange}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                pageCount={Math.ceil(totalBanners / itemsPerPage)}
                containerClassName="pagination"
                pageClassName="pageItem"
                pageLinkClassName="pageLink"
                previousClassName="pageItem"
                previousLinkClassName="pageLink previousLink"
                nextClassName="pageItem"
                nextLinkClassName="pageLink nextLink"
                activeClassName="active"
                breakClassName="breakItem"
                forcePage={Math.min(
                  Math.max(0, currentPage - 1),
                  Math.ceil(totalBanners / itemsPerPage) - 1
                )}
              />
            </div>
          )}

          {showForm && (
            <>
              <div
                className="modal-overlay"
                onClick={() => setShowForm(false)}
              ></div>
              <div className="modal-container">
                <h3>{isEdit ? "Sửa" : "Thêm"} Banner</h3>
                <form onSubmit={handleSave}>
                  <label>Trạng thái:</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="1">Hiển thị</option>
                    <option value="0">Ẩn</option>
                  </select>

                  <label>Hình ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                  />

                  {formData.image && (
                    <img
                      src={
                        formData.image instanceof File
                          ? URL.createObjectURL(formData.image)
                          : formData.image
                      }
                      alt="Preview"
                      style={{ width: "150px", marginTop: "10px" }}
                    />
                  )}

                  <button type="submit">Lưu</button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBanner;
