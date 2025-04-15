import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import "../../styles/Admin/styleadmin.css"; // Đảm bảo đường dẫn đúng
import Bieudo from "../../components/Admin/Bieudo.jsx"; // Đảm bảo đường dẫn đúng


const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [revenueDay, setRevenueDay] = useState(0);
  const [revenueWeek, setRevenueWeek] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy tổng số đơn hàng
        const ordersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/orders`);
        if (!ordersResponse.ok) throw new Error("Lỗi khi lấy tổng số đơn hàng");
        const ordersData = await ordersResponse.json();
        setTotalOrders(ordersData.total || 0);

        // Lấy tổng số người dùng
        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/users`);
        if (!usersResponse.ok) throw new Error("Lỗi khi lấy tổng số người dùng");
        const usersData = await usersResponse.json();
        setTotalUsers(usersData.total || 0);

        // Lấy số người dùng mới
        const newUsersResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/users/new`);
        if (!newUsersResponse.ok) throw new Error("Lỗi khi lấy người dùng mới");
        const newUsersData = await newUsersResponse.json();
        setNewUsers(newUsersData.newUsers || 0);


        // Gọi API doanh thu gộp theo ngày, tuần, tháng và tổng doanh thu
        const revenueAllResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/all`);
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
  }, []);


  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          <Menu size={24} />
        </div>

      </div>
      <div className="cardBox">
        <div className="card">
          <div>
            <div>
              <div className="numbers">{revenueDay.toLocaleString()} VND</div>
              <div className="cardName">Doanh Thu Theo Ngày</div>
            </div>
          </div>
          <div className="iconBx">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{revenueWeek.toLocaleString()} VND</div>
            <div className="cardName">Doanh Thu Theo Tuần</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cart-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{revenueMonth.toLocaleString()} VND</div>
            <div className="cardName">Doanh Thu Theo Tháng</div>
          </div>
          <div className="iconBx">
            <ion-icon name="people-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{totalRevenue.toLocaleString()} VND</div>
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
        <div className="card">
          <div>
            <div className="numbers">42</div>
            <div className="cardName">Số Lượng Bài Viết</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cash-outline"></ion-icon>
          </div>
        </div>
      </div>
      <div className="graphBox">

        <Bieudo />
      </div>

      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Bảng Doanh Thu</h2>
          </div>
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Price</td>
                <td>Payment</td>
                <td>Status</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Star Refrigerator</td>
                <td>$1200</td>
                <td>Paid</td>
                <td><span className="status delivered">Delivered</span></td>
              </tr>
              <tr>
                <td>Window Coolers</td>
                <td>$110</td>
                <td>Due</td>
                <td><span className="status pending">Pending</span></td>
              </tr>
              <tr>
                <td>Speakers</td>
                <td>$620</td>
                <td>Paid</td>
                <td><span className="status return">Return</span></td>
              </tr>
              <tr>
                <td>Hp Laptop</td>
                <td>$110</td>
                <td>Due</td>
                <td><span className="status inprogress">In Progress</span></td>
              </tr>
              <tr>
                <td>Apple Watch</td>
                <td>$1200</td>
                <td>Paid</td>
                <td><span className="status delivered">Delivered</span></td>
              </tr>
              <tr>
                <td>Wall Fan</td>
                <td>$110</td>
                <td>Paid</td>
                <td><span className="status pending">Pending</span></td>
              </tr>
              <tr>
                <td>Adidas Shoes</td>
                <td>$620</td>
                <td>Paid</td>
                <td><span className="status return">Return</span></td>
              </tr>
              <tr>
                <td>Denim Shirts</td>
                <td>$110</td>
                <td>Due</td>
                <td><span className="status inprogress">In Progress</span></td>
              </tr>
              <tr>
                <td>Casual Shoes</td>
                <td>$575</td>
                <td>Paid</td>
                <td><span className="status pending">Pending</span></td>
              </tr>
              <tr>
                <td>Wall Fan</td>
                <td>$110</td>
                <td>Paid</td>
                <td><span className="status pending">Pending</span></td>
              </tr>
              <tr>
                <td>Denim Shirts</td>
                <td>$110</td>
                <td>Due</td>
                <td><span className="status inprogress">In Progress</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div >

  );
}

export default AdminDashboard;