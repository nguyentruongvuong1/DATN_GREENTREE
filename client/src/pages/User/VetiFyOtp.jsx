import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/User/verify.module.css";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(180);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [thonbgao, setthongbao] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin từ sessionStorage
  const email = sessionStorage.getItem("email");
  const username = sessionStorage.getItem("username");
  const phone = sessionStorage.getItem("phone");
  const password = sessionStorage.getItem("password");

  useEffect(() => {
    if (!email || !username || !phone || !password) {
      navigate("/dangky");
      return;
    }

    // Bộ đếm ngược
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setIsResendDisabled(false);
          message.error("Mã OTP đã hết hạn. Vui lòng chọn gửi lại mã OTP.");
          setthongbao(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [navigate, email, username, phone, password]);

  // Kiểm tra trạng thái OTP
  const checkOTPStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xacminhotp/check-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi kiểm tra OTP");
      }

      if (data.expired) {
        setIsResendDisabled(false);
        setthongbao(true);
        return setTimer(0);;
        
      } else {
        setTimer(Math.max(0, data.remainingTime));
        setIsResendDisabled(true);
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra OTP:", err);
      message.error("Không thể kiểm tra trạng thái OTP");
    }
  };

  // Kiểm tra trạng thái OTP khi component mount
  checkOTPStatus();

  // Xác minh OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      message.error("Vui lòng nhập mã OTP");
      return;
    }

    if (otp.length !== 6) {
      message.error("Mã OTP phải có 6 chữ số");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xacminhotp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            phone,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xác minh OTP thất bại");
      }

      message.success("Xác minh thành công! Đang chuyển hướng...");
      clearUserData();
      setTimeout(() => navigate("/dangnhap"), 1000);
    } catch (err) {
      message.error(err.message || "Có lỗi xảy ra, vui lòng thử lại");
      console.error(err);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dangky/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gửi lại OTP thất bại");
      }

      message.success("Đã gửi lại mã OTP thành công!");
      setTimer(180);
      window.location.reload(); // Tải lại trang để bắt đầu lại bộ đếm ngược
      setIsResendDisabled(true);
      thonbgao(false);
    } catch (err) {
      message.error(err.message || "Có lỗi khi gửi lại OTP");
      console.error(err);
    }
  };

  // Xóa dữ liệu user
  const clearUserData = () => {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("password");
  };

  // Định dạng thời gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <section className={styles.verify_container}>
      <div className={styles.verify_box}>
        <h2>Xác Minh OTP</h2>
        <p className={styles.info}>Mã OTP đã được gửi đến: {email}</p>
        {thonbgao && (
          <p className={styles.error}>
            Mã OTP đã hết hạn. Vui lòng gửi lại mã OTP.
          </p>
        )}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Nhập mã OTP 6 số"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          className={styles.otp_input}
        />

        <div className={styles.timer}>
          Thời gian còn lại: {formatTime(timer)}
        </div>

        <button
          onClick={handleVerifyOTP}
          className={styles.verify_button}
          disabled={!otp || otp.length !== 6}
        >
          Xác Minh
        </button>

        <button
          onClick={handleResendOTP}
          disabled={isResendDisabled || isResending}
          className={`${styles.resend_button} ${
            isResendDisabled ? styles.disabled : ""
          }`}
        >
          {isResending ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className={styles.loading_spinner}></span>
              Đang gửi...
            </span>
          ) : (
            "Gửi lại mã OTP"
          )}
        </button>
      </div>
    </section>
  );
}
