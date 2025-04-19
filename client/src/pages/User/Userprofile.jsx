import styles from "../../styles/User/userprofile.module.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { thoat } from "../../AuthSlice";
import { useDispatch } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";

export default function Userprofile() {
  const user = useSelector((state) => state.auth.user);
  const DaDangNhap = useSelector((state) => state.auth.DaDangNhap);
  const isChecked = useSelector((state) => state.auth.isChecked);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);

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

      <div className={styles.content}>
        <div className={styles["content-header"]}>
          <h1 className={styles["content-title"]}>Thông tin tài khoản</h1>
        </div>

        {userData && (
          <form>

<div className={styles["form-group"]}>
              <label>Ảnh đại diện</label>
                <img src={userData.avatar} alt="" />
                <input type="file"  />
            </div>

            <div className={styles["form-group"]}>
              <label>Họ và tên</label>
              <input
                type="text"
                id="fullname"
                className={styles["form-control"]}
                value={userData.username}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Email (sẽ không thay đổi được)</label>
              <input
                type="email"
                id="email"
                className={styles["form-control"]}
                value={userData.email}
              />
            </div>

            <div className={styles["form-group"]}>
              <label for="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                className={styles["form-control"]}
                value={userData.phone}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Địa chỉ</label>
              <textarea
                id="address"
                className={styles["form-control"]}
                rows="3"
              >
                {userData.address.length > 0
                  ? userData.address
                  : "Bạn chưa nhập địa chỉ"}
              </textarea>
            </div>

            <button type="submit" className={styles.btn}>
              Cập nhật thông tin
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
