import styles from "../../styles/User/Changepassnologin.module.css";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

export default function ChangePassnologin() {


  const [step, setstep] = useState(1);
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const [newpass, setnewpass] = useState("");
  const [confirmpass, setconfirmpass] = useState("");

  const navigate = useNavigate();


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
        navigate("/dangnhap");
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      message.error("Đổi mật khẩu thất bại!");
    }
  };

  return (

     
<>
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
    </>
   
  );
}
