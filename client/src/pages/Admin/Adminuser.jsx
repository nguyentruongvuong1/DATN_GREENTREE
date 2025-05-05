import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Admin/styleadmin.css";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { useSelector } from "react-redux";


const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [totalUsers, setTotalUsers] = useState(0);

    const [usfilter, ganusfilter] = useState([]) // Trạng thái tìm kiếm
    const [allUs, setallUs] = useState([]); // Tất cả để tìm kiếm
    const [search, setsearch] = useState(''); // Trạng thái tìm kiếm
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const token = useSelector((state) => state.auth.token)
    const user = useSelector((state) => state.auth.user)


    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage, token]);

    const fetchUsers = async () => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/users?page=${currentPage}&limit=${itemsPerPage}`, otp
            );
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };

useEffect(() => {
    const fetchallUsers = async () => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/users`, otp
            );
            setallUs(data.users || []); // gán allUs với dữ liệu users

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        }
    };
    fetchallUsers();
}, [token]); 

    const onchangeSearch = (e) => {
        setsearch(e.target.value)
    }

    useEffect(() => {
        if (search === '') {
            ganusfilter(users)
        } else {
            const FilterUs = allUs.filter(us => us.username.toLowerCase().includes(search.toLowerCase()))
            ganusfilter(FilterUs)
        }

    }, [search, allUs, users])


    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected + 1);
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/user/${userId}`, { status: newStatus }, otp);
            // Cập nhật lại danh sách người dùng
            fetchUsers();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
        }
    };
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowDetail(true);
    };
    const closeDetail = () => {
        setSelectedUser(null);
        setShowDetail(false);
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
                        <h2>Quản Lý Người Dùng</h2>

                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã tài khoản</th>
                                <th>Tên đăng nhập</th>
                                <th>Điện thoại</th>
                                <th>Tổng tiền đã mua</th>
                                {/* <th>Bậc</th> */}
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usfilter.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.total_buy}</td>
                                    {/* <td>{level[user.level]}</td> */}
                                    <td>{user.role === 1 ? "Người dùng" : "Admin"}</td>
                                    <td>
                                        <select
                                            className={`status-select ${user.status === 2 ? 'locked' : 'active'}`}
                                            value={user.status}
                                            onChange={(e) => handleStatusChange(user.id, parseInt(e.target.value))}
                                        >
                                            <option value={1}>Bình thường</option>
                                            <option value={2}>Khóa</option>
                                        </select>
                                    </td>
                                    <td>{moment(user.create_date).format('DD-MM-YYYY')}</td>
                                    <td>
                                        <button className="btn-detail" onClick={() => handleViewUser(user)}>
                                            Xem
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showDetail && selectedUser && (
                        <div className="modal-overlay userDetailOverlay">
                            <div className="modal-container userDetailForm">
                                <h2>Chi tiết người dùng</h2>
                                <p><strong>ID:</strong> {selectedUser.id}</p>
                                <p><strong>Tên đăng nhập:</strong> {selectedUser.username}</p>
                                <p><strong>Điện thoại:</strong> {selectedUser.phone}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Địa chỉ:</strong> {selectedUser.address}</p>
                                <p><strong>Số lượng sản phẩm đã mua:</strong> {selectedUser.quantity_pr_buy}</p>
                                <p><strong>Tổng tiền đã mua:</strong> {Number(selectedUser.total_buy).toLocaleString('vi')} VNĐ</p>
                                {/* <p><strong>Bậc:</strong> {level[selectedUser.level]}</p> */}
                                <p><strong>Vai trò:</strong> {selectedUser.role === 1 ? "Người dùng" : "Admin"}</p>
                                <p><strong>Trạng thái:</strong> {selectedUser.status === 1 ? "Bình thường" : "Khóa"}</p>
                                <p><strong>Ngày tạo:</strong> {moment(selectedUser.create_date).format('DD-MM-YYYY')}</p>
                                <button type="button" className="cancel-btn" onClick={closeDetail}>Đóng</button>
                            </div>
                        </div>
                    )}

                    {totalUsers > itemsPerPage && (
                        <div className="paginationContainer">
                            <ReactPaginate
                                breakLabel="⋯"
                                nextLabel=">"
                                previousLabel="<"
                                onPageChange={handlePageChange}
                                pageRangeDisplayed={2}
                                marginPagesDisplayed={1}
                                pageCount={Math.ceil(totalUsers / itemsPerPage)}
                                containerClassName="pagination"
                                pageClassName="pageItem"
                                pageLinkClassName="pageLink"
                                previousClassName="pageItem"
                                previousLinkClassName="pageLink previousLink"
                                nextClassName="pageItem"
                                nextLinkClassName="pageLink nextLink"
                                activeClassName="active"
                                breakClassName="breakItem"
                                forcePage={Math.min(Math.max(0, currentPage - 1), Math.ceil(totalUsers / itemsPerPage) - 1)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUser;
