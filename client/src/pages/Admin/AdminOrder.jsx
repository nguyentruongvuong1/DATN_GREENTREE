import React, { useState, useEffect } from "react";
import { Menu, Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "../../styles/Admin/styleadmin.css";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

export default function AdminOrder() {
  const getStatusName = (status) => {
    switch (status) {
      case 1:
        return "Chờ xác nhận";
      case 2:
        return "Xác nhận";
      case 3:
        return "Đang giao";
      case 4:
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const [order, setOrder] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalOrder, setTotalOrder] = useState(0);
  const [model, setmodel] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  const [orderInfo, setOrderInfo] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [allOdr, setallOdr] = useState([]); // Tất cả đơn hàng để tìm kiếm
  const [search, setsearch] = useState(""); // Trạng thái tìm kiếm
  const [odrfilter, ganodrfilter] = useState([]); // Trạng thái tìm kiếm
  const token = useSelector((state) => state.auth.token);

  const statusMap = {
    1: "Chờ xác nhận",
    2: "Đã xác nhận",
    3: "Đang giao hàng",
    4: "Đã nhận hàng",
  };

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

      setmodel(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const otp = {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };

        let url = `${import.meta.env.VITE_API_URL}/admin/order?page=${currentPage}&limit=${itemsPerPage}`;
        if (orderStatus) {
          url += `&order_status=${orderStatus}`;
        }
      const response = await axios.get(url, otp);
      setOrder(response.data.order || response.data);
      setTotalOrder(response.data.total || response.data.length);


      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
      }
    };
    fetchOrder();
  }, [currentPage, itemsPerPage, token, orderStatus]);

  useEffect(() =>{
    const fetchallOrder = async () =>{
      try{
        
          const otp = {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          };
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/allorder`, otp);
        const data = await res.json();
        setallOdr(data.order || data);

      }catch (error) {
        console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
      }
    }
    fetchallOrder()
  },[token])

  useEffect(() => {
    if (search === "") {
      ganodrfilter(order);
    } else {
      const FilterOdr = allOdr.filter((odr) =>
        odr.id.toLowerCase().includes(search.toLowerCase())
      );
      ganodrfilter(FilterOdr);
    }
  }, [search, allOdr, order]);

  const onchangeSearch = (e) => {
    setsearch(e.target.value);
  };

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    try {
      const otp = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/order_status/${orderId}`,
        { order_status: newStatus },
        otp
      );

      // Cập nhật UI ngay lập tức
      setOrder((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, order_status: newStatus } : item
        )
      );

      alert(res.data.message || "Cập nhật thành công!");
    } catch (error) {
      console.error("Chi tiết lỗi:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Lỗi server! Vui lòng thử lại.");
    }
  };

  const handleTransactionStatusChange = async (
    orderId,
    currentTransactionStatus,
    newTransactionStatus
  ) => {
    try {
      const otp = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/transaction_status`,
        { id: orderId, new_transaction_status: newTransactionStatus },
        otp
      );

      // Cập nhật lại UI trạng thái thanh toán
      setOrder((prev) =>
        prev.map((item) =>
          item.id === orderId
            ? { ...item, transaction_status: newTransactionStatus }
            : item
        )
      );

      alert(res.data.message || "Cập nhật trạng thái thanh toán thành công!");
    } catch (error) {
      console.error("Chi tiết lỗi:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Lỗi server! Vui lòng thử lại.");
    }
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          <Menu size={24} />
        </div>
        <div className="search">
          <label>
            <input
              type="text"
              value={search}
              onChange={onchangeSearch}
              placeholder="Tìm kiếm..."
            />{" "}
            <Search size={24} />
          </label>
        </div>
        <div className="user">
          <img src="/images/user.jpg" alt="User" />
        </div>
      </div>
      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Quản Lý Đơn Hàng</h2>
          </div>
          <div className="sxpr">
          <select 
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Chờ xác nhận</option>
            <option value="2">Đã xác nhận</option>
            <option value="3">Đang giao</option>
            <option value="4">Giao hàng thành công</option>
          </select>
          </div>
          <table className="comment-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã DH</th>
                <th>TT thanh toán</th>
                <th>Mã thanh toán</th>
                <th>Thanh toán</th>
                <th>Tông tiền</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {odrfilter.map((or, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{or.id}</td>
                  <td>
                    <select
                      value={or.transaction_status}
                      onChange={(e) =>
                        handleTransactionStatusChange(
                          or.id,
                          or.transaction_status,
                          parseInt(e.target.value)
                        )
                      }
                    >
                      {[1, 2].map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={
                            status === 1 && or.transaction_status === 2 // Không cho phép chuyển từ 2 về 1
                          }
                        >
                          {status === 2 ? "Đã thanh toán" : "Chưa thanh toán"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{or.transaction_code}</td>
                  <td>{or.payment_method === 1 ? "Tiền mặt" : "VNPAYS"}</td>
                  <td>{Number(or.total_amount).toLocaleString("vi")} VNĐ</td>
                  <td>{moment(or.create_at).format("DD-MM-YYYY")}</td>
                  <td>
                    <select
                      value={or.order_status}
                      onChange={(e) =>
                        handleStatusChange(
                          or.id,
                          or.order_status,
                          parseInt(e.target.value)
                        )
                      }
                    >
                      {[1, 2, 3, 4].map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={
                            status <= or.order_status ||
                            status - or.order_status > 1
                          }
                        >
                          {getStatusName(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => fetchOrderDetail(or.id)}>Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalOrder > itemsPerPage && (
            <div className="paginationContainer">
              <ReactPaginate
                breakLabel="⋯"
                nextLabel=">"
                previousLabel="<"
                onPageChange={handlePageChange}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                pageCount={Math.ceil(totalOrder / itemsPerPage)}
                containerClassName="pagination"
                pageClassName="pageItem"
                pageLinkClassName="pageLink"
                previousClassName="pageItem"
                previousLinkClassName="pageLink previousLink"
                nextClassName="pageItem"
                nextLinkClassName="pageLink nextLink"
                activeClassName="active"
                breakClassName="breakItem"
                forcePage={Math.min(
                  Math.max(0, currentPage - 1),
                  Math.ceil(totalOrder / itemsPerPage) - 1
                )}
              />
            </div>
          )}
        </div>

        {model && (
          <div className="modal-overlay" onClick={() => setmodel(false)}>
            <div className="modal-container-order">
              <div className="invoiceContainer">
                <div className="invoiceHeader">
                  <div className="logo">
                    <h1>GREEN TREE SHOP</h1>
                  </div>
                  <div className="invoiceInfo">
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

                <div className="customerInfo">
                  <div className="shippingInfo">
                    <h3>Thông tin giao hàng</h3>
                    <p>
                      <strong>Họ tên:</strong> <span>{orderInfo?.name}</span>
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong>{" "}
                      <span>{orderInfo?.address}</span>
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
                  <div className="paymentInfo">
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

                <div className="orderDetails">
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
                                     <td colSpan="4" className=textRight}>
                                       Tạm tính:
                                     </td>
                                     <td></td>
                                   </tr>
                                   <tr>
                                     <td colSpan="4" className=textRight}>
                                       Phí vận chuyển:
                                     </td>
                                     <td></td>
                                   </tr>
                                   <tr>
                                     <td colSpan="4" className=textRight}>
                                       Giảm giá:
                                     </td>
                                     <td>-</td>
                                   </tr> */}
                      <tr className="totalRow">
                        <td colSpan="4" className="textRight">
                          Tổng cộng:
                        </td>
                        <td>{Number(totalPrice).toLocaleString("vi")} VNĐ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="invoiceFooter">
                  <div className="thankYou">
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
                  <div className="actions">
                    <button onClick={handlePrint} className="btn">
                      <FontAwesomeIcon icon={faPrint} /> In hóa đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
