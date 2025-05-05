import styles from "../../styles/User/userprofile.module.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { thoat } from "../../AuthSlice";
import { useDispatch } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ChangePass() {
  const user = useSelector((state) => state.auth.user);
  const DaDangNhap = useSelector((state) => state.auth.DaDangNhap);
  const isChecked = useSelector((state) => state.auth.isChecked);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [level, setlevel] = useState(null);

  const [step, setstep] = useState(1);
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const [newpass, setnewpass] = useState("");
  const [confirmpass, setconfirmpass] = useState("");

  // Lấy thông tin user từ API
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
    const fetchLevel = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/rank/${user?.id}`
        );
        const [result] = await res.json();
        setlevel(result);
      } catch (error) {
        console.log("Lỗi lấy bậc của tài khoản", error);
      }
    };
    if (user?.id) {
      fetchLevel();
    }
  }, [user?.id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/upload-avatar/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.avatar) {
        message.success("Cập nhật ảnh đại diện thành công!");
        setUserData((prev) => ({
          ...prev,
          avatar: res.data.avatar,
        }));
      } else {
        message.error("Cập nhật ảnh đại diện thất bại!");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      message.error("Đã xảy ra lỗi khi cập nhật ảnh đại diện.");
    }
  };

  const handleRequestotp = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        message.success(data.message);
        setstep(2);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi gửi OTP:", error);
      message.error("Gửi OTP thất bại!");
    }
  };

  const handleVerifyotp = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        message.success(data.message);
        setstep(3);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      message.error("Xác thực OTP thất bại!");
    }
  };

  const handleChangepass = async () => {
    if (!newpass || !confirmpass) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newpass.length < 6) {
      message.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (newpass.length > 20) {
      message.error("Mật khẩu không được quá 20 ký tự!");
      return;
    }

    if (newpass !== confirmpass) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/reset_pass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newpass }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        message.success(data.message);
        setstep(1);
        setemail("");
        setotp("");
        setnewpass("");
        setconfirmpass("");
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      message.error("Đổi mật khẩu thất bại!");
    }
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
            src={userData?.avatar}
            alt="User Avatar"
            className={styles.avatar}
            onClick={() => document.getElementById("avatarInput").click()} // Khi nhấn vào ảnh sẽ mở input
          />
          <input
            type="file"
            id="avatarInput"
            style={{ display: "none" }}
            onChange={handleAvatarChange} // Khi chọn ảnh mới sẽ gọi hàm này
          />
          <h3 className={styles.username}>
            {userData?.username || "Người dùng"}
          </h3>
          <p className={styles["user-email"]}>{user?.email}</p>
          <p className={styles["user-email"]}>Tài khoản bậc: {level?.rank}</p>
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
          <h1 className={styles["content-title"]}>Đổi mật khẩu</h1>
        </div>

        <div className={styles["forgot-container"]}>
          {step === 1 && (
            <div>
              <h3>Nhập email để đổi mật khẩu</h3>
              <input
                type="email"
                placeholder="Vui lòng email của bạn"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />
              <button onClick={handleRequestotp}>Gửi OTP</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>Nhập mã OTP đã gửi đến email</h3>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setotp(e.target.value)}
              />
              <button onClick={handleVerifyotp}>Xác thực</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>Đặt lại mật khẩu</h3>
              <input
                type="password"
                placeholder="Vui lòng nhập mật khẩu mới. Mật khẩu từ 6-20 ký tự"
                value={newpass}
                onChange={(e) => setnewpass(e.target.value)}
              />
              <input
                type="password"
                placeholder="Vui lòng nhập lại mật khẩu"
                value={confirmpass}
                onChange={(e) => setconfirmpass(e.target.value)}
              />
              <button onClick={handleChangepass}>Đổi mật khẩu</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
