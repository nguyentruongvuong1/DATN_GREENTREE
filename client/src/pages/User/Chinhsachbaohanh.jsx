import styles from '../../styles/User/chinhsachbaohanh.module.css';

export default function Chinhsachbaohanh() {
  return (
    <div className={styles.background}>
      <div className={styles.container}>
      <h1>Chính Sách Bảo Hành</h1>
        <div className={styles.content}>
          <h2>1. Điều kiện bảo hành - hoàn trả sản phẩm</h2>
          <p>
            - Quý khách còn giữ xác nhận về việc đã mua hàng tại Green Tree Shop (hóa đơn mua hàng, biên nhận giao hàng, sao kê của ngân hàng...)
          </p>
          <p>
            - Sản phẩm không nằm trong danh mục hạn chế đổi trả.
          </p>
          <p>- Sản phẩm phải còn nguyên tem, mác, nguyên đai kiện ban đầu (trừ trường hợp sản phẩm bị lỗi hoặc hư hại trong quá trình vận chuyển) và quà tặng kèm (nếu có).</p>
        </div>

        <div className={styles.content}>
          <h2>2. Quy trình thực hiện đổi trả hàng</h2>
          <div className={styles.info}>
            <p>- Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi ký nhận hàng và báo ngay cho nhân viên giao hàng nếu có phát hiện lỗi sản phẩm hoặc liên hệ ngay với bộ phận chăm sóc khách hàng.<br />
              - Bộ phận Kỹ Thuật sẽ liên hệ ngay với quý khách để xác nhận yêu cầu và lý do đổi trả, thống nhất giao dịch đổi trả cho sản phẩm.<br />
              - Đối với hàng hoá nhỏ và đơn hàng các tỉnh thành khác: quý khách vui lòng mang tới/vận chuyển tới cửa hàng hoặc kho hàng gần nhất để đổi trả.<br />
              - Đối với hàng hoá cồng kềnh đã lắp ráp: Green Tree Shop sẽ bảo hành tận nơi tại TP HCM cho quý khách.<br />
              - Quý khách hàng vui lòng kiểm tra kỹ sản phẩm một lần nữa trước khi ký nhận đổi trả hàng.</p>
          </div>
        </div>

        <div className={styles.content}>
          <h2>3. Quy định đổi trả / bảo hành</h2>
          <div className={styles.mini}>3.1 - Quy định đổi trả / bảo hành được áp dụng đối với những hàng hóa và lỗi sau:</div>
          <div className={styles.info}>
            <p>
              - Sản phẩm không đúng như thông tin đăng tải (sai công dụng, sai thành phần, ...). <br />
              - Sản phẩm bị bể vỡ/trầy xước/biến dạng trong quá trình vận chuyển trừ trường hợp vận chuyển theo chỉ định của khách hàng. <br />
              - Sản phẩm nhận không đúng với đơn hàng đã đặt. <br />
              - Các lỗi sản phẩm do quá trình sản xuất hoặc vận chuyển, lắp ráp như sau: <br />
              * Trầy tróc, chảy sơn bề mặt. <br />
              * Móp, méo, cong vênh các chi tiết sản phẩm. <br />
              * Sứt, mẻ cạnh, góc sản phẩm. <br />
              * Hở đinh, ốc.
            </p>
          </div>
          <div className={styles.mini}>3.2 - Không áp dụng đổi trả đối với những trường hợp sau:</div>
          <div className={styles.info}>
            <p>
              - Các sản phẩm trong Chương trình Giảm giá và Khuyến mại hoặc từ Cửa hàng Giảm giá.<br />
              - Các hư hỏng gây ra trong quá trình sử dụng sau khi mua hàng như sử dụng không cẩn thận, đặt trong môi trường không đảm bảo, bảo quản không đúng hướng dẫn, tải trọng quá mức vệ sinh sản phẩm không đúng cách,...<br />
              - Các hao mòn thông thường (ví dụ: phai mờ, rỉ sét, lỏng đinh vít hoặc bản lề sau một khoảng thời gian...)<br />
              - Va chạm do tai nạn khi sử dụng hoặc khi quý khách tự vận chuyển sản phẩm.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <h2>4. Thời gian giải quyết các đơn hàng đổi trả:</h2>
          <div className={styles.info}>
            <p>
              - Việc gửi sản phẩm thay thế hoặc hoàn tiền chỉ được bắt đầu sau khi chúng tôi đã hoàn tất việc kiểm tra đánh giá sản phẩm quý khách gửi lại.<br />
              - Quy trình đánh giá chất lượng sản phẩm từ 3-5 ngày làm việc.<br />
              - Bộ phận kỹ thuật sẽ liên hệ và thống nhất với khách hàng về quyết định sửa chữa hoặc đổi trả, thống nhất lịch giao hàng với quý khách hàng.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <h2>5. Phí vận chuyển đối sản phẩm đổi trả/bảo hành</h2>
          <p>- Green Tree Shop bảo hành miễn phí đối với các sản phẩm cồng kềnh trong thời hạn bảo hành.<br />
            - Quý khách thanh toán phí vận chuyển đối với các đơn hàng đổi trả theo biểu phí tại mục II.3</p>
        </div>
      </div>
    </div>
  );
}