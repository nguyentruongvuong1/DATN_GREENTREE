import React, { useState, useEffect } from "react";
import "../../styles/Admin/styleadmin.css";
import { useSelector } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import Addlevel from "../../components/Admin/AdminLevel/Addlevel";
import Updatelevel from "../../components/Admin/AdminLevel/Update";
const AdminLevel = () => {
  const [level, setlevel] = useState([]);
  const token = useSelector((state) => state.auth.token);
  const [modeladd, setmodeladd] = useState(false);
  const [modeledit, setmodeledit] = useState(false);
  const [UpdateId, setUpdateId] = useState(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchLevel = async () => {
      const otp = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/level`,
        otp
      );
      const result = await res.json();
      setlevel(result);
    };
    fetchLevel();
  });

  const Deletelevel = async (id) => {
    const hoi = confirm("Xác nhận xóa bậc này.");
    if (hoi) {
      const otp = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/level/${id}`,
        otp
      );
      if (res.ok) {
        message.success("Xóa bậc thành công");
      } else {
        return;
      }
    }
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
          <ion-icon name="menu-outline"></ion-icon>
        </div>
        <div className="search">
          <label>
            <input type="text" placeholder="Tìm kiếm..." />{" "}
            <ion-icon name="search-outline"></ion-icon>
          </label>
        </div>
        <div className="user">
          <img src={user.avatar} alt="User" />
        </div>
      </div>

      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Quản Lý Bậc</h2>
            <button className="buttonAdd" onClick={() => setmodeladd(true)}>
              Thêm Bậc
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Bậc</th>
                <th>Tông tiền</th>
                <th>Giá trị giảm</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {level.map((l, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{l.rank}</td>
                  <td>{Number(l.total_buy).toLocaleString("vi")}</td>
                  <td>{l.discount_value} %</td>
                  <td>
                    <button
                      onClick={() => {
                        setUpdateId(l.id); // chỉ cần id
                        setmodeledit(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button onClick={() => Deletelevel(l.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modeladd && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setmodeladd(false)}
          ></div>
          <div className="modal-containerpr">
            <Addlevel />
          </div>
        </>
      )}

      {modeledit && UpdateId && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setmodeledit(false)}
          ></div>
          <div className="modal-containerpr">
            <Updatelevel id={UpdateId} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLevel;
