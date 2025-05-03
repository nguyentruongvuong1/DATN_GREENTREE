import React, { useState, useEffect } from "react";
import styles from "../../styles/User/payment.module.css";
import { useDispatch, useSelector } from "react-redux";
import { XoaGH } from "../../CartSlice";
import { useNavigate } from "react-router-dom";
import '@ant-design/v5-patch-for-react-19'
import { message } from "antd";
export default function Payment() {

  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const cartItems = cart.listPr || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const voucher = useSelector((state) => state.cart.voucher)

  useEffect(() => {
     if (cartItems.length === 0) {
      message.error("Giỏ hàng trống, vui lòng thêm sản phẩm trước khi thanh toán");
      navigate('/');
      return;
    }else if (!user?.id) {
        message.error("Vui lòng đăng nhập trước khi thanh toán");
        navigate('/dangnhap');
        return;

    } 
  }, [user, cartItems, navigate]);

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    note: "",
  });



  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa thông tin

  const total = cartItems.reduce((acc, item) => {
    const price = item.price_sale > 0 ? item.price_sale : item.price;
    return acc + price * item.so_luong;
  }, 0);

  const shippingFee = 50000;
  let discountvalue = 0;
  const subtotal = total + shippingFee;

  
if (voucher && voucher.discount_type === 'fixed') {
  discountvalue = voucher.discount_value || 0;
} else if (voucher && voucher.discount_type === 'percent') {
  discountvalue = subtotal * ((voucher.discount_value || 0) / 100);
}

const grandTotal = Math.max(subtotal - discountvalue, 0);
  


  // Tự động điền thông tin khi user có sẵn thông tin
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || user.username || "",
        address: user.address || "",
        phone: user.phone || "",
        note: "",
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const validatePhone = (phone) => {
    const regex = /^(0|\+84)[1-9][0-9]{8}$/;
    return regex.test(phone);
  };

  const generateTransactionCode = () => {
    return "GTSCODE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  };

  const OrderId = () => {
    return "GTS-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  };

  const handleCheckout = async () => {
    // Validate dữ liệu
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!validatePhone(formData.phone)) {
      alert("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        id: OrderId(),
        voucher_id: voucher?.id || null,
        user_id: user?.id || null,
        order_status: 0,
        transaction_status: paymentMethod === "cash_on_delivery" ? 1 : 2,
        payment_method: paymentMethod === "cash_on_delivery" ? 1 : 2,
        transaction_code:
          paymentMethod === "online_payment" ? generateTransactionCode() : null,
        customer_info: formData,
        total_amount: grandTotal,
        items: cartItems.map((item) => ({
          pr_id: item.id,
          quantity: item.so_luong,
          price: item.price_sale > 0 ? item.price_sale : item.price,
          total:
            (item.price_sale > 0 ? item.price_sale : item.price) *
            item.so_luong,   
        })),
      };

      
        const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        });

        const result = await response.json();

        if (response.ok) {
          
          if(paymentMethod === "online_payment") {
            if(result?.paymentUrl){
              window.location.href = result.paymentUrl;
            }
            else{
              throw new Error("Không nhận được link thanh toán từ VNPAY");
            }
          }else if(paymentMethod === "cash_on_delivery"){
            message.success("Đặt hàng thành công, vui lòng kiểm tra email để biết thêm thông tin");
            setTimeout(() => {
            navigate("/");
            dispatch(XoaGH());
            }, 2000);
          }
          else {
            throw new Error("Không nhận được phản hồi từ máy chủ");
          }
        
        } 
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
    

    
  };

 

  return (
   
        <div className={styles.container}>
        <div className={styles.title}>
      <h2>THANH TOÁN</h2>
      </div>
      <div className={styles.checkout}>
        <div className={styles.info}>
          <div>
            <h3>THÔNG TIN THANH TOÁN</h3>
            {user && (
              <button className={styles.editButton} onClick={toggleEdit}>
                {isEditing ? "Sử dụng thông tin đã lưu" : "Chỉnh sửa thông tin"}
              </button>
            )}
          </div>

          <label>Tên *</label>
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={!isEditing && user}
          />

          <label>Địa chỉ giao sản phẩm *</label>
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleInputChange}
            required
            disabled={!isEditing && user}
          />

          <label>Số điện thoại *</label>
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleInputChange}
            required
            disabled={!isEditing && user}
          />

          <label>Ghi chú đơn hàng</label>
          <textarea
            name="note"
            placeholder="Ghi chú để có thể dễ dàng giao hàng"
            value={formData.note}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className={styles["order-summary"]}>
          <h3>ĐƠN HÀNG CỦA BẠN</h3>

          {cartItems.map((item, index) => {
            const price = item.price_sale > 0 ? item.price_sale : item.price;
            return (
              <div key={index} className={styles["order-item"]}>
                <div className={styles["item-info"]}>
                  <img src={typeof item.images === "string" ? item.images.split(",")[0]: item.images[0]}
                    alt={item.name}
                  />
                  <p className={styles["item-info-name"]}>{item.name}</p>
                   <p>{price.toLocaleString()} x {item.so_luong}   </p> 

                </div>
              </div>
            );
          })}

          <div className={styles.payment}>
            <h4>PHƯƠNG THỨC THANH TOÁN</h4>
            <label className={styles["payment-method"]}>
              <input
                type="radio"
                name="payment"
                value="cash_on_delivery"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={handlePaymentMethodChange}
              />
                <p>Thanh toán khi nhận hàng (COD)</p>
            </label>

            <label className={styles["payment-method"]}>
              <input
                type="radio"
                name="payment"
                value="online_payment"
                checked={paymentMethod === "online_payment"}
                onChange={handlePaymentMethodChange}
              />
                <p>Thanh toán bằng VNPAYS</p>
            </label>
          </div>

          <div className={styles["total"]}>
            <div>
              <strong>Tổng cộng:</strong>{" "}
              <span>{total.toLocaleString()} VNĐ</span>
            </div>
            <div>
              <strong>Phí vận chuyển:</strong>{" "}
              <span>{shippingFee.toLocaleString()} VNĐ</span>
            </div>
            {voucher && (
              <>
               <div>
              <strong>Mã giảm giá:</strong>{" "}
              <span>{voucher.code}</span>
            </div>
            <div>
              <strong>Giá trị giảm:</strong>{" "}
              {voucher.discount_type === 'fixed' ? (
                <span>{Number(voucher.discount_value).toLocaleString('vi')} VNĐ</span>
              ) :(
                <span>{voucher.discount_value} %</span>
              )}
              
            </div>
              </>
            )}
           
            <div className={styles["grand-total"]}>
              <strong>Tổng thanh toán:</strong>{" "}
              <span>{Number(grandTotal).toLocaleString('vi')} VNĐ</span>
            </div>
          </div>

          <button
            className={styles["checkout-btn"]}
            onClick={handleCheckout}
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
          </button>
        </div>
      </div>
    </div>
    
  );
}
