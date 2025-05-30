import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { XoaGH } from "../../CartSlice";
import { useDispatch } from "react-redux";
import styles from "../../styles/User/checkpayment.module.css";
function Checkpayment() {
  const [searchParams] = useSearchParams();
  const [status, setstatus] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/payment/check_payment?${searchParams.toString()}`
        );
        if (res.data.success) {
          setstatus("success");
          message.success(
            "Đặt hàng thành công, vui lòng kiểm tra email để biết thêm thông tin"
          );
          dispatch(XoaGH());
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          setstatus("fail");
          message.error(
            `Thanh toán thất bại đơn hàng ${res.data.orderId} đã bị hủy`
          );
          setTimeout(() => {
            navigate("/thanhtoan");
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className={styles["payment-status-container"]}>
      {status === null && (
        <p className={styles["payment-status-processing"]}>Đang xử lý thanh toán...</p>
      )}
      {status === "success" && (
        <p className={styles["payment-status-success"]}>🎉 Cảm ơn bạn đã mua hàng!</p>
      )}
      {status === "fail" && (
        <p className={styles["payment-status-fail"]}>❌ Thanh toán thất bại!</p>
      )}
      {status === "error" && (
        <p className={styles["payment-status-error"]}>🚨 Đã xảy ra lỗi hệ thống.</p>
      )}
    </div>
  );
}

export default Checkpayment;
