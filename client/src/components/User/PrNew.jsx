import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from"../../styles/User/prdanhchoban.module.css";
import moment from "moment";
import {
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { themPr } from "../../CartSlice";
import { checkLogin, updateCountPrlike } from "../../AuthSlice";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { Link } from "react-router-dom";
import axios from 'axios'

export default function PrNew() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [prhot, setPrHot] = useState([]);
  const [likePr, setLikePr] = useState({});

  // Kiểm tra user đăng nhập
  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

  // Lấy danh sách sản phẩm hot và sản phẩm yêu thích
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách sản phẩm hot
        const resHot = await fetch(`${import.meta.env.VITE_API_URL}/pr/prnew`);
        const hotData = await resHot.json();
        setPrHot(hotData);

        // Nếu có user, lấy danh sách sản phẩm yêu thích của user
        if (user && user.id) {
          const resFav = await fetch(
            `${import.meta.env.VITE_API_URL}/pr/user-favorite/${user.id}`
          );
          const likedProductIds = await resFav.json();

          // Tạo object likePr từ dữ liệu API
          const likedStatus = hotData.reduce((acc, pr) => {
            acc[pr.id] = likedProductIds.includes(pr.id);
            return acc;
          }, {});
          setLikePr(likedStatus);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm hoặc danh sách yêu thích:", error);
      }
    };
    fetchData();
  }, [user]);

  // Xử lý toggle thích sản phẩm
  const toggleFavorite = async (pr_id) => {
    if (!user || !user.id) {
      message.error("Bạn cần đăng nhập để thích sản phẩm!");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pr/toggle-favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, pr_id }),
      });

      const data = await response.json();
      if (data.success) {
        setLikePr((prev) => ({
          ...prev,
          [pr_id]: data.liked,
        }));

        dispatch(updateCountPrlike(data.liked ? 1 : -1));
        message.success(
          data.liked ? `Bạn đã thích sản phẩm!` : "Bạn đã hủy thích sản phẩm!"
        );
      }
    } catch (error) {
      console.error("Lỗi khi toggle yêu thích:", error);
    }
  };

  // Tang view
  const View = async (id) => await axios.post(`${import.meta.env.VITE_API_URL}/pr/view/${id}`); 


  return (
    <main className={styles.bgmain}>
      <section className={styles.container}>
        <div className={styles.title}>
          <div className={styles.title_name}>
             <div className={styles.title_namegt}>
                       <img src={'/images/title.png'} alt="" />
                        SẢN PHẨM MỚI
                       </div>
          </div>
        </div>

        <div className={styles.products}>
          {prhot.map((pr) => (
            <div className={styles.product} key={pr.id}>
              <div className={styles.product_img}>
                <img
                  src={
                    pr.images ? pr.images.split(",")[0] : "/default-image.jpg"
                  }
                  alt={pr.name}
                />
              </div>
              <div className={styles.pr_thongbao} style={{backgroundColor:'#f29320'}}>
                <p>New</p>
              </div>
              <div
                className={`${styles.pr_tim} ${
                  likePr[pr.id] ? styles.liked : ""
                }`}
                onClick={() => toggleFavorite(pr.id)}
              >
                <i>
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{
                      color: likePr[pr.id] ? "red" : "white",
                      stroke: likePr[pr.id] ? "none" : "#F29320",
                      strokeWidth: likePr[pr.id] ? "0" : "15px",
                      padding: "2px",
                    }}
                  />
                </i>
              </div>
              <div className={styles.product_btn}>
                <div className={styles.pr_xemchitiet}>
                  <button onClick={() => View(pr.id)}>
                    {" "}
                    <Link
                      to={`/chi_tiet_san_pham/${pr.id}`}
                      className={styles.btnxct}
                    >
                      {" "}
                      Xem chi tiết{" "}
                    </Link>{" "}
                  </button>
                </div>
                <div className={styles.pr_themvaogio}>
                  <button
                    onClick={() => {
                      if(pr.inventory_quantity === 0){
                        message.error('Sản phẩm đã hết hàng. Nếu bạn muốn mua sản phẩm này hãy liên hệ với chúng tôi để được hỗ trợ')
                      }else{
                        dispatch(themPr(pr));
                        message.success("Bạn đã thêm sản phẩm vào giỏ hàng");
                      }
                     
                    }}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
              <div className={styles.product_info}>
                <p className={styles.product_price}>{pr.name}</p>
                <p>{Number(pr.price).toLocaleString("vi")} VNĐ</p>
                <p><strong>{moment(pr.create_date).format(' DD-MM-YYYY')}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
