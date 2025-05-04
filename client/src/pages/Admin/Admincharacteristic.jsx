import React, { useState, useEffect } from "react";
import axios from "axios";
import { Menu, Search } from "lucide-react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"; // Import icon mũi tên
import { Link } from "react-router-dom";
import "../../styles/Admin/styleadmin.css";
import moment from "moment"; // Import moment.js để định dạng ngày tháng
import { useSelector } from "react-redux";
import ReactPaginate from "react-paginate";


const Admincharacteristic = () => {
    const [characteristic, setcharacteristics] = useState([]);
    const [allChar, setAllChar] = useState([]);
    const [editcharacteristic, setEditcharacteristic] = useState(null); // Lưu characteristic đang chỉnh sửa
    const [showAddForm, setShowAddForm] = useState(false); // Ẩn/hiện form
    const [categories, setCategories] = useState([]);
    const [newcharacteristic, setNewcharacteristic] = useState({
        cate_id: "",  // Không để undefined
        name: "",     // Không để undefined
    });

    const token = useSelector((state) => state.auth.token)
    const [viewTypecates, setViewTypecates] = useState([]);
    const [showViewTypecates, setShowViewTypecates] = useState(false);
    const [currentCharacteristicName, setCurrentCharacteristicName] = useState(""); // Để hiển thị tên
    const itemsPerPage = 8;
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState(''); // State để lưu giá trị tìm kiếm
    const [charfilter, ganCharfilter] = useState([])


    // Lấy danh sách characteristics khi component mount
    useEffect(() => {
        fetchcharacteristics();
    }, [currentPage, token]);

    // Hàm lấy danh sách characteristic từ API
    const fetchcharacteristics = async () => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/characteristic?page=${currentPage + 1}&limit=${itemsPerPage}`, otp);
            setcharacteristics(response.data.characteristics);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

    useEffect(() => {
        const fetchallcharacteristics = async () => {
            try {
                const otp = {
                    headers: {
                        "Content-Type": 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                }
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/characteristic`, otp);
                setAllChar(response.data.characteristics); // Lưu tất cả characteristics vào state
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };
        fetchallcharacteristics(); // Gọi lại hàm khi currentPage thay đổi
    }, [token]);

    useEffect(() => {
        if (search === '') {
            ganCharfilter(characteristic)
        } else {
            const FilterChar = allChar.filter(vc => vc.name.toLowerCase().includes(search.toLowerCase()))
            ganCharfilter(FilterChar)
        }

    }, [search, allChar, characteristic])

    const onchangeSearch = (e) => {
        setSearch(e.target.value)
    }
    // Hàm xóa characteristic
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa characteristic này không?")) return;

        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/adminc/characteristic/${id}`, otp);
            console.log("Response:", response.data);

            if (response.status === 200) {
                alert("Xóa thành công!");
                fetchcharacteristics(); // Load lại danh sách
            } else {
                alert("Xóa thất bại: " + response.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi xóa characteristic:", error);
        }
    };

    // Cập nhật giá trị của characteristic mới
    const handleNewcharacteristicChange = (e) => {
        setNewcharacteristic({ ...newcharacteristic, [e.target.name]: e.target.value });
    };

    // Thêm mới characteristic
    const handleAddcharacteristic = async (e) => {
        e.preventDefault();

        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/adminc/characteristic`, newcharacteristic, otp);
            console.log("Response:", response.data);

            if (response.status === 200) {
                alert("Thêm đặc điểm thành công!");
                setNewcharacteristic({ code: "", discount_type: "fixed", discount_value: "", quantity: "", end_date: "", status: "1" });
                fetchcharacteristics(); // Load lại danh sách
                setShowAddForm(false); // Ẩn form sau khi thêm
            } else {
                alert("Thêm đặc điểm thất bại: " + response.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi thêm đặc điểm:", error);
            if (error.response && error.response.data.message) {
                alert("Lỗi: " + error.response.data.message);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/cate`, otp);
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    // Gọi API khi component được render
    useEffect(() => {
        fetchcharacteristics();
        fetchCategories();
    }, []);

    // Hàm mở form sửa
    const handleEdit = (characteristic) => {
        setEditcharacteristic(characteristic);
    };

    // Cập nhật giá trị khi nhập vào form
    const handleChange = (e) => {
        setEditcharacteristic({ ...editcharacteristic, [e.target.name]: e.target.value });
    };

    // Cập nhật characteristic khi thay đổi
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/adminc/characteristic/${editcharacteristic.id}`, editcharacteristic, otp);
            console.log("Response:", response.data);

            if (response.status === 200) {
                alert("Cập nhật thành công!");
                setEditcharacteristic(null);
                fetchcharacteristics();
            } else {
                alert("Cập nhật thất bại: " + response.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật characteristic:", error);
            if (error.response && error.response.data.message) {
                alert("Lỗi: " + error.response.data.message);
            }
        }
    };

    const handleViewTypecate = async (characteristic) => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            };
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminc/type_cates/${characteristic.id}`, otp);
            setViewTypecates(response.data);
            setCurrentCharacteristicName(characteristic.name);
            setShowViewTypecates(true);
        } catch (error) {
            console.error("Lỗi khi lấy typecate:", error);
            alert("Không thể tải danh sách thể loại");
        }
    };

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
    useEffect(() => {
        fetchcharacteristics();
    }, [currentPage]);


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
                        <h2>Quản Lý Đặc Điểm</h2>
                        <button className="buttonAdd" onClick={() => setShowAddForm(true)}>Thêm Đặc Điểm</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Đặc Điểm</th>
                                <th>Danh Mục</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charfilter.map((characteristic, index) => (
                                <tr key={index}>
                                    <td>{characteristic.id}</td>
                                    <td>{characteristic.name}</td>
                                    <td>{characteristic.cate_name}</td>
                                    <td>{moment(characteristic.create_at).format('DD-MM-YYYY')}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => handleEdit(characteristic)}>Sửa</button>
                                        <button className="btn-delete" onClick={() => handleDelete(characteristic.id)}>Xóa</button>
                                        <button className="btn-detail" onClick={() => handleViewTypecate(characteristic)}>Xem</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Form chỉnh sửa characteristic */}
                    {editcharacteristic && (
                        <>
                            <div className="modal-overlay" onClick={() => setEditcharacteristic(null)}></div>
                            <div className="modal-container">
                                <span className="modal-close-btn" onClick={() => setEditcharacteristic(null)}>&times;</span>
                                <h3>Sửa Đặc Điểm</h3>
                                <form onSubmit={handleSave}>
                                    <label>Tên Đặc Điểm:</label>
                                    <input type="text" name="name" value={editcharacteristic.name} onChange={handleChange} required />
                                    <button type="submit">Lưu</button>
                                    <button type="button" className="cancel-btn" onClick={() => setEditcharacteristic(null)}>Hủy</button>
                                </form>
                            </div>
                        </>
                    )}

                    {/* Form thêm characteristic */}
                    {showAddForm && (
                        <>
                            <div className="modal-overlay" onClick={() => setShowAddForm(false)}></div>
                            <div className="modal-container">
                                <span className="modal-close-btn" onClick={() => setShowAddForm(false)}>&times;</span>
                                <h3>Thêm Đặc Điểm</h3>

                                <form onSubmit={handleAddcharacteristic}>
                                    <label>Tên Đặc Điểm:</label>
                                    <input type="text" name="name" value={newcharacteristic.name} onChange={handleNewcharacteristicChange} required />
                                    <label>Danh Mục:</label>
                                    <select name="cate_id" value={newcharacteristic.cate_id || ""} onChange={handleNewcharacteristicChange} required>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((cate) => (
                                            <option key={cate.id} value={cate.id}>
                                                {cate.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit">Lưu</button>
                                    <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Hủy</button>
                                </form>
                            </div>
                        </>
                    )}

                    {showViewTypecates && (
                        <>
                            <div className="modal-overlay" onClick={() => setShowViewTypecates(false)}></div>
                            <div className="modal-container viewTypecates-modal">
                                <span className="modal-close-btn" onClick={() => setShowViewTypecates(false)}>&times;</span>
                                <h3>Thể loại của: {currentCharacteristicName}</h3>

                                {viewTypecates.length > 0 ? (
                                    <ul>
                                        {viewTypecates.map((type) => (
                                            <li key={type.id}>- {type.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Không có thể loại nào thuộc đặc điểm này.</p>
                                )}

                                <button className="cancel-btn" onClick={() => setShowViewTypecates(false)}>Đóng</button>
                            </div>
                        </>
                    )}

                    {totalItems > itemsPerPage && (
                        <div className="paginationContainer">
                            <ReactPaginate
                                breakLabel="⋯"
                                nextLabel=">"
                                previousLabel="<"
                                onPageChange={handlePageChange}
                                pageRangeDisplayed={2}
                                marginPagesDisplayed={1}
                                pageCount={Math.ceil(totalItems / itemsPerPage)}
                                containerClassName="pagination"
                                pageClassName="pageItem"
                                pageLinkClassName="pageLink"
                                previousClassName="pageItem"
                                previousLinkClassName="pageLink previousLink"
                                nextClassName="pageItem"
                                nextLinkClassName="pageLink nextLink"
                                activeClassName="active"
                                breakClassName="breakItem"
                                forcePage={currentPage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admincharacteristic;
