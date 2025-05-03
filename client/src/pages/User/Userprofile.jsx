import styles from "../../styles/User/userprofile.module.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { thoat } from "../../AuthSlice";
import { useDispatch } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import axios from 'axios'

export default function Userprofile() {
  const user = useSelector((state) => state.auth.user);
  const DaDangNhap = useSelector((state) => state.auth.DaDangNhap);
  const isChecked = useSelector((state) => state.auth.isChecked);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [level, setlevel] = useState(null)


  const [formData, setformData] = useState(
    {
      username: '',
      phone: '',
      address: '',
    }
  )

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user?.id) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/user/user/${user.id}`
          );
          const data = await res.json();
          setUserData(data);
          setformData({
            username: data.username || '',
            phone: data.phone || '',
            address: data.address || '',
          })
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };
    fetchUser();
  }, [user?.id]);

  useEffect(() => {
      const fetchLevel = async () =>{
        try{
          const res = await fetch(`${import.meta.env.VITE_API_URL}/user/rank/${user?.id}`);
          const [result] = await res.json()
          setlevel(result)
          
        }catch(error){
          console.log("Lỗi lấy bậc của tài khoản", error)
        }
      }
      if (user?.id) {
        fetchLevel();
      }
  },[user?.id])

  const infochange = (e) =>{
    const {name, value} = e.target;
    setformData((pre) =>({
      ...pre, 
      [name] : value,
    }))
  }


  const Updateinfo = async (e) =>{
    e.preventDefault();
    try{
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/update/${user.id}`, formData)
      if(res.data?.message === 'Cập nhật thành công') {
        message.success('Bạn đã cập nhật thông tin tài khoản thành công.')
        setUserData((prevData) => ({
          ...prevData,
          ...formData,
        }));
      }else{
        message.error('Cập nhật thông tin thất bại')
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      message.error("Có lỗi xảy ra!");
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    try{
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/upload-avatar/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data?.avatar) {
        message.success('Cập nhật ảnh đại diện thành công!');
        setUserData((prev) => ({
          ...prev,
          avatar: res.data.avatar,
        }));
      }else{
        message.error('Cập nhật ảnh đại diện thất bại!');
      }

    }catch (error) {
    console.error('Lỗi upload avatar:', error);
    message.error('Đã xảy ra lỗi khi cập nhật ảnh đại diện.');
  }
  };

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
            src={userData?.avatar}
            alt="User Avatar"
            className={styles.avatar}
            onClick={() => document.getElementById('avatarInput').click()}  // Khi nhấn vào ảnh sẽ mở input

          />
          <input
            type="file"
            id="avatarInput"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}  // Khi chọn ảnh mới sẽ gọi hàm này
          />
          <h3 className={styles.username}>
            {userData?.username}
          </h3>
          <p className={styles["user-email"]}>{userData?.email}</p>
          <p className={styles["user-email"]}>Tài khoản bậc: {level?.rank}</p>
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

      <div className={styles.content}>
        <div className={styles["content-header"]}>
          <h1 className={styles["content-title"]}>Thông tin tài khoản</h1>
        </div>

        {userData && (
          <form onSubmit={Updateinfo}>
            <div className={styles["form-group"]}>
              <label>Họ và tên</label>
              <input
                type="text"
                id="fullname"
                name="username"
                className={styles["form-control"]}
                value={formData.username}
                onChange={infochange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={styles["form-control"]}
                value={formData.phone}
                onChange={infochange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Địa chỉ</label>
              <textarea
                id="address"
                name="address"
                className={styles["form-control"]}
                rows="3"
                value={formData.address}
                
                onChange={infochange}

              />
              
            </div>

            <button type="submit"  className={styles.btn}>
              Cập nhật thông tin
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
