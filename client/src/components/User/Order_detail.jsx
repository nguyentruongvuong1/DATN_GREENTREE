import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/User/order_detail.module.css";
import moment from "moment";

export default function Orderdetail() {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const statusMap = {
    1: "Chờ xác nhận",
    2: "Đã xác nhận",
    3: "Đang giao hàng",
    4: "Đã nhận hàng",
  };

  //   Lấy dữ liệu đơn hàng từ API
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/user/orderdetail_user/${order_id}`
        );
        if (!res.ok) {
          throw new Error("Lỗi khi tải thông tin đơn hàng");
        }
        const data = await res.json();
        setOrderInfo(data.order);
        setOrderItems(data.items);
        console.log(data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
      }
    };
    fetchOrderDetail();
  }, [order_id]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.invoiceContainer}>
      <div className={styles.invoiceHeader}>
        <div className={styles.logo}>
          <h1>GREEN TREE SHOP</h1>
        </div>
        <div className={styles.invoiceInfo}>
          <h2>HÓA ĐƠN</h2>
          <p>
            Mã đơn hàng: <span>{orderInfo?.id}</span>
          </p>
          <p>
            Ngày đặt:{" "}
            <span>{moment(orderInfo?.create_at).format("DD-MM-YYYY")}</span>
          </p>
        </div>
      </div>

      <div className={styles.customerInfo}>
        <div className={styles.shippingInfo}>
          <h3>Thông tin giao hàng</h3>
          <p>
            <strong>Họ tên:</strong> <span>{orderInfo?.name}</span>
          </p>
          <p>
            <strong>Địa chỉ:</strong> <span>{orderInfo?.address}</span>
          </p>
          <p>
            <strong>SĐT:</strong> <span>{orderInfo?.phone}</span>
          </p>
          {/* <p><strong>Email:</strong> <span>{orderInfo.email}</span></p> */}
          <p>
            <strong>Ghi chú:</strong>{" "}
            <span>
              {orderInfo?.note.length > 0
                ? orderInfo?.note
                : "Không có ghi chú"}
            </span>
          </p>
        </div>
        <div className={styles.paymentInfo}>
          <h3>Phương thức thanh toán</h3>
          <p>
            <strong>Hình thức:</strong>{" "}
            <span>
              {orderInfo?.payment_method === 1
                ? "Thanh toán khi nhận hàng"
                : " Thanh toán VNPAYS"}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong> {" "}
            <span>
             {statusMap[orderInfo?.order_status] || "Không xác định"}
            </span>
          </p>
         
        </div>
      </div>

      <div className={styles.orderDetails}>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.product_name}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>{item.total}</td>
                </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className={styles.textRight}>
                Tạm tính:
              </td>
              <td></td>
            </tr>
            <tr>
              <td colSpan="4" className={styles.textRight}>
                Phí vận chuyển:
              </td>
              <td></td>
            </tr>
            <tr>
              <td colSpan="4" className={styles.textRight}>
                Giảm giá:
              </td>
              <td>-</td>
            </tr>
            <tr className={styles.totalRow}>
              <td colSpan="4" className={styles.textRight}>
                Tổng cộng:
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.invoiceFooter}>
        <div className={styles.thankYou}>
          <p>
            Cảm ơn quý khách đã mua hàng tại <strong>Cây cảnh XYZ</strong>!
          </p>
          <p>
            Mọi thắc mắc xin liên hệ hotline: <strong>1900 1234</strong> hoặc
            email: <strong>support@caycanhxyz.com</strong>
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={handlePrint} className={styles.btn}>
            <FontAwesomeIcon icon={faPrint} /> In hóa đơn
          </button>
          <button onClick={handleBack} className={styles.btn}>
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
