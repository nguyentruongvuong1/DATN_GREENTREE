import styles from "../../styles/User/userprofile.module.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { thoat } from "../../AuthSlice";
import { useDispatch } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import moment from "moment";
import { Link } from "react-router-dom";

export default function OrderUser() {
  const user = useSelector((state) => state.auth.user);
  const DaDangNhap = useSelector((state) => state.auth.DaDangNhap);
  const isChecked = useSelector((state) => state.auth.isChecked);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);

  const [order, setorder] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusMap = {
    1: "Chờ xác nhận",
    2: "Đã xác nhận",
    3: "Đang giao hàng",
    4: "Đã nhận hàng",
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user?.id) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/user/user/${user.id}`
          );
          const data = await res.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };
    fetchUser();
  }, [user?.id]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/order_user/${user?.id}`)
      .then((res) => res.json())
      .then((result) => setorder(result));
  }, [user?.id]);

  const fetchOrderDetail = async (order_id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/orderdetail_user/${order_id}`
      );

      if (!res.ok) {
        throw new Error(`Lỗi server: ${res.status}`);
      }

      const text = await res.text();
      if (!text.trim()) {
        throw new Error("API trả về dữ liệu rỗng");
      }

      const data = JSON.parse(text);
      setOrderDetail(data);
      setSelectedOrderId(order_id);
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      setOrderDetail([]); // Tránh lỗi undefined khi render
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isChecked) {
    // Nếu chưa kiểm tra đăng nhập xong thì chưa render gì cả
    return null; // hoặc có thể là spinner
  }

  if (!DaDangNhap) {
    return <Navigate to="/dangnhap" replace={true} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles["profile-header"]}>
          <img
            src={userData?.avatar || "/default-avatar.png"}
            alt="User Avatar"
            className={styles.avatar}
          />
          <h3 className={styles.username}>
            {userData?.username || "Người dùng"}
          </h3>
          <p className={styles["user-email"]}>{user?.email}</p>
        </div>

        <div className={styles.menu}>
          <button className={styles["menu-item"]}>
            <Link to={"/info"}>Thông tin tài khoản</Link>
          </button>
          <button className={styles["menu-item"]}>
            <Link to={"/info_changepass"}>Đổi mật khẩu </Link>
          </button>
          <button className={styles["menu-item"]}>
            <Link to={"/info_order"}>Đơn hàng </Link>
          </button>
          <button
            onClick={() => {
              const hoi = confirm(
                "Bạn có chắc chắn muốn đăng xuất tài khoản không?"
              );
              if (hoi) {
                dispatch(thoat());
                message.success("Đăng xuất thành công!");
                setTimeout(() => {
                  window.location.href = "/";
                }, 1000);
              } else {
                return;
              }
            }}
            className={styles["menu-item"]}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {order.length === 0 ? (
        <div className={styles.content}>
          <div className={styles["content-header"]}>
            <h2 className={styles["content-title"]}>Thông tin tài khoản</h2>
          </div>
          <h3>Bạn chưa có đơn hàng nào</h3>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles["content-header"]}>
            <h1 className={styles["content-title"]}>Thông tin tài khoản</h1>
          </div>

          <div className={styles.container}>
            <div className={styles.history}>
              <div className={styles.text}>
                <b>Lịch sử đơn hàng</b>
              </div>
              <table className={styles.table_order}>
                <thead>
                  <tr>
                    <th>Mã ĐH</th>
                    <th>Voucher</th>
                    <th>TT đơn hàng</th>
                    <th>TT thanh toán</th>
                    <th>Mã Giao dịch</th>
                    <th>Phương thức thanh toán</th>
                    <th>Ngày</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((or, index) => (
                    <tr key={index}>
                      <td>{or.id}</td>
                      <td>
                        {or.voucher_id === "" ? or.voucher_id : "Không sử dụng"}
                      </td>
                      <td>{statusMap[or.order_status] || "Không xác định"}</td>
                      <td>
                        {or.transaction_status === 2
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </td>
                      <td>{or.transaction_code}</td>
                      <td>{or.payment_method === 1 ? "Tiền mặt" : "VNPAY"}</td>
                      <td>{moment(or.create_at).format("DD-MM-YYYY")}</td>
                      <td>
                        <button
                          onClick={() => fetchOrderDetail(or.id)}
                          className={styles.btn_xem}
                        >
                          {" "}
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles["modal-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles["close-btn"]} onClick={closeModal}>
              X
            </button>
            <h3>Chi tiết đơn hàng #{selectedOrderId}</h3>
            <table className={styles.table_order}>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>SĐT</th>
                  <th>Địa chỉ</th>
                  <th>Ghi chú</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Tổng giá</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {orderDetail.map((item, index) => (
                  <tr key={index}>
                    <td>{item.order_name}</td>
                    <td>{item.order_phone}</td>
                    <td>{item.order_address}</td>
                    <td>
                      {item.order_note.length > 0
                        ? item.order_note
                        : "Không có"}
                    </td>
                    <td>{item.pr_id}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString("vi")}</td>
                    <td>{(item.price * item.quantity).toLocaleString()} đ</td>
                    <td>{moment(item.create_at).format("DD-MM-YYYY")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
