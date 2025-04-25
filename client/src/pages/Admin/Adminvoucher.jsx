import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Admin/styleadmin.css";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { Menu, Search } from "lucide-react";
import { useSelector } from "react-redux";

const AdminVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [allVc, setallVc] = useState([]); // Tất cả voucher để tìm kiếm
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Số voucher mỗi trang
  const [totalVouchers, setTotalVouchers] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc"); // Trạng thái sắp xếp (tăng dần hoặc giảm dần)
  const [search, setsearch] = useState(''); // Trạng thái tìm kiếm
  const [vcfilter, ganvcfilter] = useState([]) // Trạng thái tìm kiếm
  const token = useSelector((state) => state.auth.token)


  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const otp = {
          headers: {
            "Content-Type": 'application/json',
            'Authorization': 'Bearer ' + token
        }
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/vouchers?page=${currentPage}&limit=${itemsPerPage}`,otp
        );
        setVouchers(response.data.vouchers || response.data);
        setTotalVouchers(response.data.total || response.data.length);
        setallVc(response.data.vouchers || response.data); // gán allVc với dữ liệu voucher
      } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
      }
    };
    fetchVouchers();
  }, [currentPage, itemsPerPage]);

  const onchangeSearch = (e) => {
    setsearch(e.target.value)
  }

  useEffect(() => {
    if (search === '') {
      ganvcfilter(vouchers)
    } else {
      const FilterVc = allVc.filter(vc => vc.code.toLowerCase().includes(search.toLowerCase()))
      ganvcfilter(FilterVc)
    }

  }, [search, allVc, vouchers])

  const fetchVouchers = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/vouchers?page=${currentPage}&limit=${itemsPerPage}`
      );
      setVouchers(data.vouchers || []);
      setTotalVouchers(data.total || 0);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này không?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/voucher/${id}`);
      fetchVouchers();
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.discount_type || isNaN(formData.discount_value) || isNaN(formData.quantity) || !formData.end_date || isNaN(formData.status)) {
      alert("Vui lòng điền đầy đủ và đúng định dạng thông tin!");
      return;
    }

    const preparedData = {
      ...formData,
      discount_value: Math.max(0, Number(formData.discount_value)),
      quantity: Number(formData.quantity),
      status: Number(formData.status),
      start_date: formData.start_date?.trim()
        ? `${formData.start_date} 00:00:00`
        : moment().format("YYYY-MM-DD HH:mm:ss"),
        end_date: formData.start_date?.trim()
        ? `${formData.start_date} 00:00:00`
        : moment().format("YYYY-MM-DD HH:mm:ss"),    };



    try {
      if (isEdit) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/voucher/${formData.id}`, preparedData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/voucher`, preparedData);
      }
      fetchVouchers();
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      alert(error.response?.data?.message || "Lưu voucher thất bại!");
    }
  };


  // const handlePageChange = (page) => {
  //   setCurrentPage(Math.max(1, page)); // Đảm bảo trang không nhỏ hơn 1
  // };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };
  const handleSort = () => {
    const sortedVouchers = [...vouchers];
    if (sortOrder === "asc") {
      sortedVouchers.sort((a, b) => a.id - b.id); // Sắp xếp tăng dần
      setSortOrder("desc");
    } else {
      sortedVouchers.sort((a, b) => b.id - a.id); // Sắp xếp giảm dần
      setSortOrder("asc");
    }
    setVouchers(sortedVouchers); // Cập nhật lại vouchers với thứ tự đã sắp xếp
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          <Menu size={24} />
        </div>
        <div className="search">
          <label>
            <input
              type="text"
              value={search}
              onChange={onchangeSearch} placeholder="Tìm kiếm..."

            />
            <Search size={24} />
          </label>
        </div>
        <div className="user">
          <img src="/images/user.jpg" alt="User" />
        </div>
      </div>
      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Quản Lý Mã Giảm Giá</h2>
            <button className="buttonAdd" onClick={() => { setShowForm(true); setIsEdit(false); setFormData({ code: '', discount_type: 'fixed', discount_value: '', quantity: '', start_date: '', end_date: '', status: 1 }); }}>Thêm Voucher</button>
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={handleSort} style={{ cursor: "pointer" }}>
                  ID {sortOrder === "asc" ? "↑" : "↓"}
                </th>
                <th>Mã giảm giá</th>
                <th>Số lượng</th>
                <th>Kiểu giảm</th>
                <th>Giá trị</th>
                <th>Đã sử dụng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vcfilter.map((voucher) => (
                <tr key={voucher.id}>
                  <td>{voucher.id}</td>
                  <td>{voucher.code}</td>
                  <td>{voucher.quantity}</td>
                  <td>{voucher.discount_type}</td>
                  <td>{voucher.discount_value}</td>
                  <td>{voucher.used_count}</td>
                  <td>{moment(voucher.start_date).format('DD-MM-YYYY')}</td>
                  <td>{moment(voucher.end_date).format('DD-MM-YYYY')}</td>
                  <td>{voucher.status === 1 ? "Hoạt động" : "Hết hạn"}</td>
                  <td>{moment(voucher.created_at).format('DD-MM-YYYY')}</td>
                  <td>
                    <button onClick={() => { setShowForm(true); setIsEdit(true); setFormData(voucher); }}>Sửa</button>
                    <button onClick={() => handleDelete(voucher.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalVouchers > itemsPerPage && (
            <div className="paginationContainer">
              <ReactPaginate
                breakLabel="⋯"
                nextLabel=">"
                previousLabel="<"
                onPageChange={handlePageChange}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                pageCount={Math.ceil(totalVouchers / itemsPerPage)}
                containerClassName="pagination"
                pageClassName="pageItem"
                pageLinkClassName="pageLink"
                previousClassName="pageItem"
                previousLinkClassName="pageLink previousLink"
                nextClassName="pageItem"
                nextLinkClassName="pageLink nextLink"
                activeClassName="active"
                breakClassName="breakItem"
                forcePage={Math.min(Math.max(0, currentPage - 1), Math.ceil(totalVouchers / itemsPerPage) - 1)}
              />
            </div>
          )}


          {showForm && (
            <>
              {/* Lớp phủ nền để làm mờ background */}
              <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
              <div className="modal-container">
                <h3>{isEdit ? "Sửa" : "Thêm"} Voucher</h3>
                <form onSubmit={handleSave}>
                  <label>Mã Voucher:</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  <label>Loại giảm:</label>
                  <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}>
                    <option value="fixed">Giảm tiền</option>
                    <option value="percent">Giảm phần trăm</option>
                  </select>
                  <label>Giá trị giảm:</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                  <label>Số lượng:</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                  <label>Ngày bắt đầu:</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  <label>Ngày hết hạn:</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  <label>Trạng thái:</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="1">Hoạt động</option>
                    <option value="0">Hết hạn</option>
                  </select>
                  <button type="submit">Lưu</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVoucher;
