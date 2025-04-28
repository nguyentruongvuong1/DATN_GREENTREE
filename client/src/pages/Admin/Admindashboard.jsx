import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import "../../styles/Admin/styleadmin.css"; // Đảm bảo đường dẫn đúng
import Bieudo from "../../components/Admin/Bieudo.jsx"; // Đảm bảo đường dẫn đúng
import { useSelector } from "react-redux";



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
  }, []);

  useEffect(() => {
    const fetchDailyDetails = async () => {
      try {
        const otp = {
          method : 'GET',
          headers: {
            "Content-Type": 'application/json',
            'Authorization': 'Bearer ' + token
        }
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/day/details`,otp);
        if (!res.ok) throw new Error("Lỗi khi gọi API doanh thu theo ngày");
        const data = await res.json();
        setDailyOrders(data);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu chi tiết theo ngày:", error);
        setDailyOrders([]); // đảm bảo không undefined
      }
    };

    fetchDailyDetails();
  }, []);

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
              <div className="numbers">{Number(revenueDay).toLocaleString('vi')} VND</div>
              <div className="cardName">Doanh Thu Theo Ngày</div>
            </div>
          </div>
          <div className="iconBx">
            <ion-icon name="eye-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{Number(revenueWeek).toLocaleString('vi')} VND</div>
            <div className="cardName">Doanh Thu Theo Tuần</div>
          </div>
          <div className="iconBx">
            <ion-icon name="cart-outline"></ion-icon>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="numbers">{Number(revenueMonth).toLocaleString('vi')} VND</div>
            <div className="cardName">Doanh Thu Theo Tháng</div>
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
    </div >

  );
}

export default AdminDashboard;