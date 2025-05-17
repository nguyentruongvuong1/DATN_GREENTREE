import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import "../../styles/Admin/styleadmin.css"; // Đảm bảo đường dẫn đúng
import Bieudo from "../../components/Admin/Bieudo.jsx"; // Đảm bảo đường dẫn đúng
import { useSelector } from "react-redux";
import UpdatePr from "../../components/Admin/AdminPr/AdminUpdatePr.jsx";


const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [revenueDay, setRevenueDay] = useState(0);
  const [revenueWeek, setRevenueWeek] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const token = useSelector((state) => state.auth.token)

  const [productStats, setProductStats] = useState({ lowStock: 0 });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [showBestSellingModal, setShowBestSellingModal] = useState(false);
  const [slowMovingProducts, setSlowMovingProducts] = useState([]);
  const [showSlowMovingModal, setShowSlowMovingModal] = useState(false);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [searchBestSelling, setSearchBestSelling] = useState("");
  const user = useSelector((state) => state.auth.user)

  const [showupdatepr, setshowupadtepr] = useState(false);
    const [UpdateId, setUpdateId] = useState(null);
  


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy tổng số đơn hàng
        const otp = {
          method: 'GET',
          headers: {
            "Content-Type": 'application/json',
            'Authorization': 'Bearer ' + token
          }
        }

        const ordersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/orders`, otp);
        if (!ordersResponse.ok) throw new Error("Lỗi khi lấy tổng số đơn hàng");
        const ordersData = await ordersResponse.json();
        setTotalOrders(ordersData.total || 0);

        // Lấy tổng số người dùng

        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/users`, otp);
        if (!usersResponse.ok) throw new Error("Lỗi khi lấy tổng số người dùng");
        const usersData = await usersResponse.json();
        setTotalUsers(usersData.total || 0);

        // Lấy số người dùng mới
        const newUsersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/users/new`, otp);
        if (!newUsersResponse.ok) throw new Error("Lỗi khi lấy người dùng mới");
        const newUsersData = await newUsersResponse.json();
        setNewUsers(newUsersData.newUsers || 0);


        // Gọi API doanh thu gộp theo ngày, tuần, tháng và tổng doanh thu
        const revenueAllResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/all`, otp);
        if (!revenueAllResponse.ok) throw new Error("Lỗi khi lấy doanh thu tổng hợp");
        const revenueAllData = await revenueAllResponse.json();

        setRevenueDay(revenueAllData.revenueDay || 0);
        setRevenueWeek(revenueAllData.revenueWeek || 0);
        setRevenueMonth(revenueAllData.revenueMonth || 0);
        setTotalRevenue(revenueAllData.totalRevenue || 0);


      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchDailyDetails = async () => {
      try {
        const otp = {
          method: 'GET',
          headers: {
            "Content-Type": 'application/json',
            'Authorization': 'Bearer ' + token
          }
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/day/details`, otp);
        if (!res.ok) throw new Error("Lỗi khi gọi API doanh thu theo ngày");
        const data = await res.json();
        setDailyOrders(data);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu chi tiết theo ngày:", error);
        setDailyOrders([]); // đảm bảo không undefined
      }
    };

    fetchDailyDetails();
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // cập nhật mỗi phút là đủ nếu chỉ hiển thị ngày

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const otp = {
          method: 'GET',
          headers: {
            "Content-Type": 'application/json',
            'Authorization': 'Bearer ' + token
          }
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/product/statistics`, otp);
        const data = await response.json(); // <-- quan trọng!

        setProductStats({
          lowStock: data.lowStock.length,
        });
        setLowStockProducts(data.lowStock || []);
        setSlowMovingProducts(data.slowMovingProducts || []);
        setBestSellingProducts(data.bestSellingProducts || []);

      } catch (error) {
        console.error('Lỗi khi tải thống kê sản phẩm:', error);
      }
    };

    fetchProductStats();
  }, [token]);

  const filteredBestSelling = bestSellingProducts.filter(
    (product) =>
      product.total_sold > 0 && (
        product.name.toLowerCase().includes(searchBestSelling.toLowerCase()) ||
        product.id.toString().includes(searchBestSelling)
      )

  );


  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          </div>
        <div className="user">
          <img src={user.avatar} alt="User" />
        </div>
      </div>
      <div className="cardBox">
        <div className="card">
          <div>
            <div>
              <div className="numbers">{Number(revenueDay).toLocaleString('vi')} VND</div>
              <div className="cardName">Doanh Thu Trong Ngày</div>
            </div>
          </div>
          <div className="iconBx">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{Number(revenueWeek).toLocaleString('vi')} VND</div>
            <div className="cardName">Doanh Thu Trong Tuần</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cart-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{Number(revenueMonth).toLocaleString('vi')} VND</div>
            <div className="cardName">Doanh Thu Trong Tháng</div>
          </div>
          <div className="iconBx">
            <ion-icon name="people-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{Number(totalRevenue).toLocaleString('vi')} VND</div>
            <div className="cardName">Tổng Doanh Thu</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cash-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{totalOrders}</div>
            <div className="cardName">Tổng Đơn Hàng</div>
          </div>
          <div className="iconBx">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{totalUsers}</div>
            <div className="cardName">Tổng Người Dùng</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cart-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{newUsers}</div>
            <div className="cardName">Người Dùng Mới</div>
          </div>
          <div className="iconBx">
            <ion-icon name="people-outline"></ion-icon>
          </div>
        </div>

      </div>
      <div className="graphBox">
        {/* Biểu đồ */}
        <div className="box">
          <Bieudo />
        </div>

        <div className="card-column">
          <div className="card">
            <div
              className="stat-card clickable"
              onClick={() => setShowLowStockModal(true)}
            >
              <div>
                <div className="numbers">{productStats.lowStock}</div>
                <div className="cardName">Sản Phẩm Sắp Hết</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div
              className="stat-card clickable"
              onClick={() => setShowBestSellingModal(true)}
            >
              <div>
                <div className="numbers">{bestSellingProducts.length}</div>
                <div className="cardName">Sản Phẩm Đã Bán</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div
              className="stat-card clickable"
              onClick={() => setShowSlowMovingModal(true)}
            >
              <div>
                <div className="numbers">{slowMovingProducts.length}</div>
                <div className="cardName">Sản Phẩm Tồn Kho</div>
              </div>
            </div>
          </div>

          {showSlowMovingModal && (
            <div className="admin-modal-overlay" onClick={() => setShowSlowMovingModal(false)}>
              <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={() => setShowSlowMovingModal(false)}>✕</button>
                <h4>Danh sách sản phẩm tồn kho nhiều </h4>
                {slowMovingProducts.length === 0 ? (
                  <p>Không có sản phẩm nào phù hợp.</p>
                ) : (
                  <div className="admin-slow-card-list">
                    {slowMovingProducts.map(product => (
                      <div className="admin-slow-card" key={product.id} onClick={() => {setShowSlowMovingModal(false); setUpdateId(product.id); setshowupadtepr(true) }}>
                        <img
                          src={
                            product.images && product.images.trim() !== ""
                              ? product.images.split(",")[0].trim()
                              : "/default-plant.jpg"
                          }
                          alt={product.name}
                          className="admin-slow-image"
                        />

                        <div className="admin-slow-info">
                          <h5 className="admin-slow-name">{product.name}</h5>
                          <p>Mã: {product.id}</p>
                          <p>Tồn kho: {product.inventory_quantity}</p>
                          <p>Đã bán: {product.total_sold}</p>
                          <p>Ngày tạo: {new Date(product.create_date).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showLowStockModal && (
            <div className="admin-modal-overlay" onClick={() => setShowLowStockModal(false)}>
              <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={() => setShowLowStockModal(false)}>✕</button>
                <h4>Danh sách sản phẩm sắp hết hàng</h4>
                {lowStockProducts.length === 0 ? (
                  <p>Không có sản phẩm nào sắp hết.</p>
                ) : (
                  <div className="admin-slow-card-list">
                    {lowStockProducts.map(product => (
                      <div className="admin-slow-card" key={product.id} onClick={() => { setShowLowStockModal(false); setUpdateId(product.id); setshowupadtepr(true) }}>
                        <img
                          src={
                            product.images && product.images.trim() !== ""
                              ? product.images.split(",")[0].trim()
                              : "/default-plant.jpg"
                          }
                          alt={product.name}
                          className="admin-slow-image"
                        />
                        <div className="admin-slow-info">
                          <h5 className="admin-slow-name">{product.name}</h5>
                          <p>Mã: {product.id}</p>
                          <p>Tồn kho: {product.inventory_quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {showBestSellingModal && (
            <div className="admin-modal-overlay" onClick={() => setShowBestSellingModal(false)}>
              <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="admin-modal-close" onClick={() => setShowBestSellingModal(false)}>✕</button>
                <h4>Danh sách sản phẩm đã bán</h4>

                <input
                  type="text"
                  placeholder="Tìm theo tên và mã sản phẩm"
                  value={searchBestSelling}
                  onChange={(e) => setSearchBestSelling(e.target.value)}
                  className="admin-search-input"
                />

                {filteredBestSelling.length === 0 ? (
                  <p>Không tìm thấy sản phẩm phù hợp.</p>
                ) : (
                  <div className="admin-slow-card-list">
                    {filteredBestSelling.map(product => (
                      <div className="admin-slow-card" key={product.id}>
                        <img
                          src={
                            product.images && product.images.trim() !== ""
                              ? product.images.split(",")[0].trim()
                              : "/default-plant.jpg"
                          }
                          alt={product.name}
                          className="admin-slow-image"
                        />
                        <div className="admin-slow-info">
                          <h5 className="admin-slow-name">{product.name}</h5>
                          <p>Mã: {product.id}</p>
                          <p>Đã bán: {product.total_sold}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}



        </div>
      </div>


      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Bảng Doanh Thu Trong Ngày</h2>
            <h4>{formattedTime}</h4>
          </div>
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Doanh thu</th>
                <th>Phương thức thanh toán</th>
                <th>Trạng thái đơn hàng</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(dailyOrders) && dailyOrders.length > 0 ? (
                dailyOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.username}</td>
                    <td>{Number(order.total_amount).toLocaleString()} VND</td>
                    <td>{order.payment_method}</td>
                    <td>{order.order_status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Không có doanh thu hôm nay hoặc lỗi khi tải dữ liệu.</td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>


              
                    {showupdatepr &&  (
                      <>
                        <div
                          className="modal-overlay"
                          onClick={() => setshowupadtepr(false)}
                        ></div>
                        <div className="modal-containerpr">
                          <UpdatePr id={UpdateId} />
                        </div>
                      </>
                    )}

    </div >

  );
}

export default AdminDashboard;