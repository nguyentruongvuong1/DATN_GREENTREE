import styles from"../../styles/User/footer.module.css"; 
import {Link} from 'react-router-dom'
export default function Footer() {
    return (
        <footer className={styles.bgfooter}>
        <div className={styles.footer}>
          <div className={styles.footer_logo}>
            <img
              height="90px"
              width="300px"
              src="/images/logwhite-removebg-preview.png"
              alt=""
            />
            <p>
              GREEN TREE SHOP mong mang đến không gian sống xanh, như là một cách
              để khơi nguồn cảm hứng, cải thiện chất lượng tinh thần tươi và đồng
              thời còn mang lại tính thẩm mỹ cho không gian nội thất.
            </p>
          </div>
  
          <div className={styles.footer_vct}>
            <p>VỀ CHÚNG TÔI</p>
            <Link to={"/gioithieu"}>Giới thiệu</Link>
            <Link to={"/lienhe"}>Liên hệ</Link>
            <Link to={"/chinh_sach_bao_mat"}>Chính sách bảo mật</Link>
            <Link to={"/chinh_sach_bao_hanh"}>Chính sách bảo hành</Link>
            <Link to={"/phuong_thuc_van_chuyen"}>Phương thức vận chuyển</Link>
          </div>
  
          <div className={styles.footer_vct}>
            <p>LIÊN HỆ</p>
            <Link to={"/"}>Hotline 1: 0364185395</Link>
            <Link to={"/"}>Hotline 2: 0337450067</Link>
            <Link to={"/"}>Email: greentreeshop@gmail.com</Link>
            <Link to={"/"}>Địa chỉ: Công Viên Phần Mền Quang Trung</Link>
          </div>
  
          <div className={styles.footer_vct}>
            <p>PHƯƠNG THỨC THANH TOÁN</p>
            <img width={'130px'} height={'120px'} style={{marginRight: '20px'}} src={'/images/ttkhi nhận hàng.png'} alt="" />

            <img width={'130px'} height={'120px'} src={'/images/logoVNPay.jpg'} alt="" />
          </div>
        </div>
  
        <div className={styles.footer_bando}>
          <h2>HƯỚNG DẪN ĐẾN GREENTREE SHOP</h2>
          <hr />
          <iframe
  title="Google Maps Embed"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4436614899205!2d106.6252534745119!3d10.85382108929969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0ef9e5%3A0x5b4da59e47aa97a8!2zQ8O0bmcgVmnDqm4gUGjhuqduIE3hu4FtIFF1YW5nIFRydW5n!5e0!3m2!1svi!2s!4v1684984988242!5m2!1svi!2s"
  width="100%"
  style={{ border: 0, height: '400px' }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  frameBorder="0"
/>
        </div>
      </footer>
    );
}
