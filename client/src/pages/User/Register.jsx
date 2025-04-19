import React, { useState, useRef } from "react";
import styles from "../../styles/User/register.module.css";
import { Link, useNavigate } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formRefs = {
    username: useRef(),
    email: useRef(),
    phone: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
  };

  const validateForm = () => {
    const { username, email, phone, password, confirmPassword } = formRefs;
    const values = {
      username: username.current.value.trim(),
      email: email.current.value.trim(),
      phone: phone.current.value.trim(),
      password: password.current.value,
      confirmPassword: confirmPassword.current.value,
    };

    // Kiểm tra các trường bắt buộc
    if (
      !values.username ||
      !values.email ||
      !values.phone ||
      !values.password ||
      !values.confirmPassword
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin");
      return false;
    }

    // Kiểm tra mật khẩu trùng khớp
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return false;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      message.error("Email không hợp lệ");
      return false;
    }

    // Kiểm tra số điện thoại (ít nhất 10 số)
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8}$/;
    if (!phoneRegex.test(values.phone)) {
      message.error("Số điện thoại không hợp lệ");
      return false;
    }

    // Kiểm tra độ dài mật khẩu
    if (values.password.length < 6 > 20) {
      message.error("Mật khẩu phải có ít nhất 6 ký tự và tối đa 20 ký tự");
      return false;
    }

    return values;
  };

  const handleRegister = async () => {
    const formValues = validateForm();
    if (!formValues) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/dangky`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formValues.username,
          email: formValues.email,
          phone: formValues.phone,
          password: formValues.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Lưu thông tin tạm thời để xác minh OTP
        sessionStorage.setItem("email", formValues.email);
        sessionStorage.setItem("username", formValues.username);
        sessionStorage.setItem("phone", formValues.phone);
        sessionStorage.setItem("password", formValues.password);

        navigate("/xacminh-otp");
      } else {
        message.error(
          data.thongbao || "Đăng ký thất bại. Do email đã tồn tại."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      message.error("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.Form_register}>
        <div className={styles.container_formrg}>
          <div className={styles.tabs}>
            <Link to="/dangnhap">Đăng Nhập</Link>
            <Link to="/dangky" className={styles.active}>
              Đăng Ký
            </Link>
          </div>

          <h2>Đăng Ký</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles["input-group"]}>
              <span className={styles.icon}>👤</span>
              <input
                type="text"
                placeholder="Họ và tên"
                ref={formRefs.username}
                required
              />
            </div>

            <div className={styles["input-group"]}>
              <span className={styles.icon}>📧</span>
              <input
                type="email"
                placeholder="Email"
                ref={formRefs.email}
                required
              />
            </div>

            <div className={styles["input-group"]}>
              <span className={styles.icon}>📞</span>
              <input
                type="tel"
                placeholder="Số điện thoại"
                ref={formRefs.phone}
                required
              />
            </div>

            <div className={styles["input-group"]}>
              <span className={styles.icon}>🔒</span>
              <input
                type="password"
                placeholder="Mật khẩu (ít nhất 6 ký tự và tối đa 20 ký tự)"
                ref={formRefs.password}
                required
                minLength="6"
              />
            </div>

            <div className={styles["input-group"]}>
              <span className={styles.icon}>🔑</span>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                ref={formRefs.confirmPassword}
                required
                minLength="6"
              />
            </div>

            <button
              type="button"
              onClick={handleRegister}
              disabled={isLoading}
              className={`${styles.btn} ${isLoading ? styles.btn_loading : ""}`}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className={styles.loading_spinner}></span>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng Ký"
              )}
            </button>
          </form>

          <p className={styles.linkdk}>
            Bạn đã có tài khoản? <Link to="/dangnhap">Đăng nhập.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
