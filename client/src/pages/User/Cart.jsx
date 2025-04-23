import styles from "../../styles/User/cart.module.css";
import { useSelector, useDispatch } from "react-redux";
import { SuaSL, XoaPr, XoaGH, ApDungVoucher, XoaVoucher } from "../../CartSlice";
import { Link } from "react-router-dom";
import { message, Modal } from "antd";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.listPr);
  const voucher = useSelector((state) => state.cart.voucher);
  const [modal, contextHolder] = Modal.useModal();
  const shippingFee = 50000;
  
  // Tính tổng tiền
  const Tongtien = useCallback(() => {
    return cart.reduce((tong, pr) => tong + pr.so_luong * pr.price, 0);
  }, [cart]);

  // Xử lý voucher và tổng cuối cùng
  const [VoucherCode, setVoucherCode] = useState(null);
  const [FinalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    let total = Tongtien() + shippingFee;
    
    if (voucher) {
      total = voucher.discount_type === 'fixed' 
        ? total - voucher.discount_value 
        : total - (total * voucher.discount_value) / 100;
    }
    
    setFinalTotal(Math.max(0, total));
  }, [Tongtien, voucher]);

  // Kiểm tra input số lượng
  const handleKeyPress = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (!(charCode <= 31 || (charCode >= 48 && charCode <= 57))) {
      event.preventDefault();
    }
  };

  // Xử lý khi rời khỏi ô số lượng
  const handleBlur = (event, id, maxQuantity) => {
    let value = parseInt(event.target.value) || 1;
    if (value <= 0) {
      value = 1;
    } else if (value > maxQuantity) {
      value = maxQuantity;
      message.warning(`Số lượng tối đa có thể mua là ${maxQuantity}`);
    }
    event.target.value = value;
    dispatch(SuaSL([id, value]));
  };

  // Xóa toàn bộ giỏ hàng
  const XoaAllCart = () => {
    modal.confirm({
      title: "Xác nhận xóa giỏ hàng",
      content: "Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        dispatch(XoaGH());
        message.success("Đã xóa toàn bộ giỏ hàng thành công");
      },
    });
  };

  // Áp dụng voucher
  const applyVoucher = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/checkvoucher`, 
        { code: VoucherCode });
      dispatch(ApDungVoucher(res.data));
      message.success("Áp dụng voucher thành công!");
    } catch (error) {
      message.error(error.response?.data?.message || "Voucher không hợp lệ");
    }
  };

  // Render UI
  if (cart.length === 0) {
    return (
      <div className={styles.bggiohang}>
        <div className={styles.container}>
          <h2 className={styles.title_no}>GIỎ HÀNG CỦA BẠN</h2>
        </div>
        <div className={styles.cart_content}>
          <h3>
            Giỏ hàng trống. <Link to="/">Mua sắm ngay</Link>
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bggiohang}>
      <h2 className={styles.title}>GIỎ HÀNG CỦA BẠN</h2>
      <div className={styles.container}>
        <div className={styles.cart}>
          <table className={styles.cart_table}>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((pr) => (
                <tr key={pr.id}>
                  <td>
                    <Link to={`/chi_tiet_san_pham/${pr.id}`}>
                      <img
                        src={Array.isArray(pr.images) ? pr.images[0] : pr.images.split(",")[0]}
                        alt={pr.name}
                        className={styles["product-img"]}
                      />
                    </Link>
                  </td>
                  <td>
                    {pr.name.length > 30 ? `${pr.name.slice(0, 30)}...` : pr.name}
                  </td>
                  <td>{pr.price.toLocaleString("vi")} VNĐ</td>
                  <td className={styles.cart_sl}>
                    <input
                      type="number"
                      min={1}
                      max={pr.inventory_quantity}
                      defaultValue={pr.so_luong}
                      onChange={(e) => {
                        let value = parseInt(e.target.value) || 1;
                        if (value > pr.inventory_quantity) {
                          value = pr.inventory_quantity;
                          message.warning(`Số lượng tối đa: ${pr.inventory_quantity}`);
                        }
                        dispatch(SuaSL([pr.id, value]));
                      }}
                      onBlur={(e) => handleBlur(e, pr.id, pr.inventory_quantity)}
                      onKeyPress={handleKeyPress}
                    />
                  </td>
                  <td>{(pr.so_luong * pr.price).toLocaleString("vi")} VNĐ</td>
                  <td>
                    <button
                      className={styles.delete}
                      onClick={() => {
                        dispatch(XoaPr(pr.id));
                        message.success(`Đã xóa ${pr.name} khỏi giỏ hàng`);
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.button}>
            {contextHolder}
            <button className={styles["delete-all"]} onClick={XoaAllCart}>
              Xóa tất cả
            </button>
          </div>
        </div>

        <div className={styles.container_tongdonhang}>
          <h3>Tổng đơn hàng</h3>
          <div className={styles.voucher}>
            <p><strong>Nhập mã giảm giá</strong></p>
            <p className={styles.voucher_note}>* Mỗi đơn hàng chỉ sử dụng được 1 voucher</p>
            <input 
              type="text" 
              onChange={(e) => setVoucherCode(e.target.value)} 
              placeholder="Nhập mã voucher"
            />
            <button onClick={applyVoucher}>Áp dụng</button>
          </div>
           {voucher?.code && (
             <div className={styles.voucher_code}>
             <p><strong>Mã giảm giá:</strong> {voucher?.code}</p>
             <button onClick={(() => dispatch(XoaVoucher()))}>Hủy</button>
             </div>
           ) }
          
          <p><strong>Thành tiền:</strong> {Tongtien().toLocaleString("vi")} VNĐ</p>
          <p><strong>Phí giao hàng:</strong> {shippingFee.toLocaleString("vi")} VNĐ</p>
          
          {voucher && (
            <p>
              <strong>Đã giảm: </strong> 
              {voucher.discount_type === "fixed" 
                ? `${voucher.discount_value.toLocaleString()} VNĐ` 
                : `${voucher.discount_value}%`}
            </p>
          )}
          
          <p className={styles.total}>
            <strong>Tổng tiền: {FinalTotal.toLocaleString("vi")} VNĐ</strong>
          </p>
          
          <div className={styles.btn_thanhtoan}>
            <button>
              <Link to="/thanhtoan">Thanh toán</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}