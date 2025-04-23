import styles from '../../styles/User/phuongthucvanchuyen.module.css';

export default function Phuongthucvanchuyen() {
  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1>Phương Thức Vận Chuyển</h1>
        <div className={styles.content}>
          <h2>1. Phạm vi giao hàng</h2>
          <p>
            Green Tree Shop phục vụ giao hàng cho khách hàng tại các địa điểm như sau:
          </p>
          
          <div className={styles.mini}>1.1 - Khu vực Tp Hồ Chí Minh</div>
          <p>
            Đơn hàng sẽ được giao đến địa điểm khách hàng yêu cầu, đối với hàng hoá cần phải lắp đặt, bộ phận giao nhận sẽ lắp ráp hoàn thiện cho khách hàng. 
            Ngoại trừ các trường hợp hạn chế như khu vực văn phòng, chung cư cao tầng có quy định hạn chế ra vào, các khu cao tầng không có khu vực gửi xe, 
            khách hàng vui lòng gọi hotline để được hỗ trợ 08 9979 9968.
          </p>
          
          <p>
            - Trường hợp quý khách không sử dụng dịch vụ lắp đặt đã bao gồm trong phí giao hàng, Green Tree Shop sẽ không chịu trách nhiệm dịch vụ lắp đặt về sau.
          </p>
          
          <p>
            Quý khách vui lòng trả tất cả các loại phí phát sinh theo quy định của Ban Quản lý nơi mình sinh sống liên quan đến việc giao hàng, 
            sử dụng thang máy, thi công...
          </p>
          
          <div className={styles.mini}>1.2 - Các tỉnh thành khác trong nước</div>
          <p>
            Green Tree Shop chỉ giao hàng đến những tỉnh thành khác những sản phẩm theo quy định vì lí do tính chất dễ vỡ của sản phẩm 
            trong lúc vận chuyển (vd: chậu gốm sứ, xi măng,...)
          </p>
          
          <p>- Có 2 hình thức giao hàng:</p>
          
          <p>
            Hình thức 1: Green Tree Shop sẽ giao hàng bằng dịch vụ Viettel Post tận nơi cho khách hàng theo địa chỉ mà khách hàng cung cấp.
          </p>
          
          <p>
            Hình thức 2: Đơn hàng sẽ được giao tới kho bãi các đơn vị vận chuyển trung gian theo chỉ định của khách hàng trong khu vực nội thành 
            thành phố Hồ Chí Minh như bến xe, nhà xe chuyên chở, ga xe lửa, ga hàng không, các đơn vị chuyển Green Tree Shop không chịu trách nhiệm 
            vận chuyển đến tận nơi cho quý khách hàng trong trường hợp này, khách hàng liên hệ với đơn vị vận chuyển trung gian để nhận hàng.
          </p>
        </div>

        <div className={styles.content}>
          <h2>2. Thời gian giao hàng</h2>
          <div className={styles.info}>
            <p>
              - Thời gian xử lí giao hàng vào 2 khung giờ: 9h -12h và 14h-17h từ thứ 2 đến thứ 7 (trừ ngày lễ, tết). 
              Trường hợp giao hàng ngoài giờ hành chính sẽ có phụ phí.<br />
              - Đơn hàng sẽ được xử lý và giao hàng trong vòng 3 ngày từ ngày xác nhận đơn hàng đối với sản phẩm có sẵn và 7-14 ngày đối với sản phẩm đặt hàng.<br />
              - Quý khách vui lòng sắp xếp thời gian hoặc sắp xếp người nhận hàng theo lịch giao hàng đã thống nhất.<br />
              - Trường hợp quý khách có thay đổi về thời gian giao hàng, hủy đơn hàng hoặc có bất cứ thay đổi nào về đơn hàng, 
              quý khách vui lòng liên hệ đến đường dây Green Tree Shop trước 24h đối với đơn hàng tại TP. Hồ Chí Minh và 48h đối với đơn hàng tại các tỉnh khác. 
              Trường hợp hủy đơn hàng muộn, Quý khách vui lòng thanh toán phí giao hàng theo đơn hàng của quý khách.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <h2>3. Phí giao hàng</h2>
          
          <div className={styles.mini}>3.1 - Khu vực Tp. Hồ Chí Minh</div>
          <div className={styles.info}>
            <p>
              - Đối với hàng hoá có kích thước nhỏ và trọng lượng nhẹ: (kích thước cạnh dài nhất bé hơn 40cm và dưới 10kg), 
              phí giao hàng sẽ được tính theo phí dịch vụ Grab, Lalamove, Ahamove áp dụng mức giá hiện hành không bao gồm mã khuyến mãi.<br />
              - Trường hợp giao hàng ngoài giờ hành chính, quý khách vui lòng thanh toán thêm 30% phí giao hàng theo quy định và tối thiểu là 50.000 đ
            </p>
          </div>
          
          <div className={styles.mini}>3.2 - Các tỉnh thành khác trong nước</div>
          <div className={styles.info}>
            <p>
              - Phí giao hàng đến đơn vị vận chuyển trung gian bằng phí giao hàng hoá cồng kềnh tại khu vực HCM<br />
              - Phí giao từ đơn vị trung gian đến địa chỉ của quý khách hàng, Green Tree Shop sẽ báo cho quý khách phí giao hàng bằng dịch vụ giao hàng 
              Viettel Post hoặc đơn vị khác sau khi nhận được đơn đặt hàng từ quý khách.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}