import styles from "../../styles/User/userprofile.module.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { thoat } from "../../AuthSlice";
import { useDispatch } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { themPr } from "../../CartSlice";
export default function OrderUser() {
  const user = useSelector((state) => state.auth.user);
  const DaDangNhap = useSelector((state) => state.auth.DaDangNhap);
  const isChecked = useSelector((state) => state.auth.isChecked);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [order, setorder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate()

  // Paginate
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalOrder, setTotalorder] = useState(0);


  const Canccel_order = async (orderId, userId) => {
    try {
      const hoi = confirm("Bạn có chắc chắn muốn hủy đơn hàng không?");
      if (hoi) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/payment/cancel_order`,
          { order_id: orderId, user_id: userId }
        );
        if (res.data.success) {
          message.success("Hủy đơn hàng thành công!");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          message.error("Hủy đơn hàng thất bại!");
        }
      } else {
        return;
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
    }
  };

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
    fetch(
      `${import.meta.env.VITE_API_URL}/user/order_user/${
        user?.id
      }?page=${currentPage}&limit=${itemsPerPage}`
    )
      .then((res) => res.json())
      .then((result) => {
        setorder(result.orders);
        setTotalorder(result.total);
      });
  }, [user?.id, currentPage, itemsPerPage]);

  const fetchOrderDetail = async (order_id) => {
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

      const total = data.items.reduce((sum, item) => sum + item.total, 0);
      setTotalPrice(total);

      setShowModal(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, page));
  };

  const handlePrint = () => {
    window.print();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const showPr = () => {
    setshowpr(false);
  };

  // Đánh giá sản phẩm
  const [showpr, setshowpr] = useState(false)
  const [pr, setpr] = useState([])

    const FetchPr = async (order_id) =>{
          try{
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/orderdetail_pr/${order_id}`);
            const result = await res.json();
            setpr(result)
            setshowpr(true)
          }catch (error) {
            console.error("Lỗi khi tải thông tin đơn hàng:", error);
          }
    } 


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
            <h2 className={styles["content-title"]}>Đơn hàng</h2>
          </div>
          <h3>Bạn chưa có đơn hàng nào</h3>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles["content-header"]}>
            <h1 className={styles["content-title"]}>Đơn hàng</h1>
          </div>

          <div>
            <div className={styles.history}>
              <table className={styles.table_order}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã đơn hàng</th>
                    <th>Trạng thái đơn hàng</th>
                    <th>Tổng tiền</th>
                    <th>Ngày</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((or, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{or.id}</td>
                      <td>{statusMap[or.order_status] || "Không xác định"}</td>
                      <td>
                        {Number(or.total_amount).toLocaleString("vi")} VNĐ
                      </td>
                      <td>{moment(or.create_at).format("DD-MM-YYYY")}</td>
                      <td>
                        <button
                          onClick={() => fetchOrderDetail(or.id)}
                          className={styles.btn_xem}
                        >
                          {" "}
                          Xem
                        </button>
                        {or.order_status === 1 && (
                          <button
                            onClick={() => Canccel_order(or.id, user.id)}
                            className={styles.btn_huy}
                          >
                            {" "}
                            Hủy đơn
                          </button>
                        )}

                        {or.order_status === 4 && or.transaction_status === 2 &&(
                          <button
                            onClick={() => FetchPr(or.id)}
                            className={styles.btn_danhgia}
                          >
                            {" "}
                            Đánh giá và mua lại 
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalOrder > itemsPerPage && (
                <div className={styles.paginationContainer}>
                  <ReactPaginate
                    breakLabel="⋯"
                    nextLabel=">"
                    previousLabel="<"
                    onPageChange={(selectedItem) =>
                      handlePageChange(selectedItem.selected + 1)
                    }
                    pageRangeDisplayed={2}
                    marginPagesDisplayed={1}
                    pageCount={Math.ceil(totalOrder / itemsPerPage)}
                    renderOnZeroPageCount={null}
                    containerClassName={styles.pagination}
                    pageClassName={styles.pageItem}
                    pageLinkClassName={styles.pageLink}
                    previousClassName={styles.pageItem}
                    previousLinkClassName={`${styles.pageLink} ${styles.previousLink}`}
                    nextClassName={styles.pageItem}
                    nextLinkClassName={`${styles.pageLink} ${styles.nextLink}`}
                    activeClassName={styles.active}
                    breakClassName={styles.break}
                    forcePage={Math.min(
                      Math.max(0, currentPage - 1),
                      Math.ceil(totalOrder / itemsPerPage) - 1
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showpr &&(
        <div className={styles.modal} onClick={() => showPr()}>
        <div
          className={styles["modal-content"]}
        >
          <table className={styles["product-table"]}>
  <thead className={styles["product-table-header"]}>
    <tr>
      <th className={styles["product-table-th"]}>STT</th>
      <th className={styles["product-table-th"]}>Tên sản phẩm</th>
      <th className={styles["product-table-th"]}>Giá</th>
      <th className={styles["product-table-th"]}>Thao tác</th>
    </tr>
  </thead>

  <tbody className={styles["product-table-body"]}>
    {pr.map((product, index) => (
      <tr key={index} className={styles["product-table-row"]}>
        <td className={styles["product-table-td"]}>{index + 1}</td>
        <td className={styles["product-table-td"]}>{product.name}</td>
        <td className={styles["product-table-td"]}>{Number(product.price).toLocaleString('vi')} VNĐ</td>
        <td className={styles["product-table-td"]}>
          <button
            className={styles["btn-review"]}
            onClick={() => navigate(`/chi_tiet_san_pham/${product.id}#reviews`)}
          >
            Đánh giá
          </button>
          <button
            className={styles["btn-rebuy"]}
            onClick={() => {
              if (product.quantity === 0) {
                message.error(
                  'Sản phẩm đã hết hàng. Nếu bạn muốn mua sản phẩm này hãy liên hệ với chúng tôi để được hỗ trợ.'
                );
                return;
              } else {
                dispatch(themPr(product));
                navigate('/giohang');
              }
            }}
          >
            Mua lại
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        
        </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles["modal-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.invoiceContainer}>
              <div className={styles.invoiceHeader}>
                <div className={styles.logo}>
                  <h1>GREEN TREE SHOP</h1>
                </div>
                <div className={styles.invoiceInfo}>
                  <h2>CHI TIẾT ĐƠN HÀNG</h2>
                  <p>
                    Mã đơn hàng: <span>{orderInfo?.id}</span>
                  </p>
                  <p>
                    Ngày đặt:{" "}
                    <span>
                      {moment(orderInfo?.create_at).format("DD-MM-YYYY")}
                    </span>
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
                    <strong>Trạng thái:</strong>{" "}
                    <span>
                      {statusMap[orderInfo?.order_status] || "Không xác định"}
                    </span>
                  </p>

                  <p>
                    <strong>Thanh toán:</strong>{" "}
                    <span>
                      {orderInfo.transaction_status === 1
                        ? "Chưa thanh toán"
                        : "Đã thanh toán"}
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
                        <td>{Number(item.price).toLocaleString("vi")}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.total).toLocaleString("vi")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* <tr>
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
                        </tr> */}
                    <tr className={styles.totalRow}>
                      <td colSpan="4" className={styles.textRight}>
                        Tổng cộng:
                      </td>
                      <td>{Number(totalPrice).toLocaleString("vi")} VNĐ</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className={styles.invoiceFooter}>
                <div className={styles.thankYou}>
                  <p>
                    Cảm ơn quý khách đã mua hàng tại{" "}
                    <strong>GREEN TREE SHOP</strong>!
                  </p>
                  <p>
                    Mọi thắc mắc xin liên hệ hotline:{" "}
                    <strong>0364185395</strong>
                  </p>
                  <p>
                    Email: <strong>greentreshop@gmail.com</strong>
                  </p>
                </div>
                <div className={styles.actions}>
                  <button onClick={handlePrint} className={styles.btn}>
                    <FontAwesomeIcon icon={faPrint} /> In hóa đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
