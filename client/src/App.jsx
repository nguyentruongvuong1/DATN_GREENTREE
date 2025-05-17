import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/User/Home";
import AdminDashboard from "./pages/Admin/Admindashboard";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import Cart from "./pages/User/Cart";
import Profcate from "./pages/User/Profcate";
import Prdetail from "./pages/User/Prdetail";
import Favorite_Pr from "./pages/User/Prlike";
import UserInfo from "./UserInfo";
import NotFound from "./pages/User/Notfound";
import ProductC from "./pages/User/Profc";
import VerifyOTP from "./pages/User/VetiFyOtp";
import Payment from "./pages/User/Payment";
import Lienhe from "./pages/User/Lienhe";
import Userprofile from "./pages/User/Userprofile";
import Checkpayment from "./pages/User/checkpayment";
import OrderUser from "./pages/User/OrderUser";
import ChangePass from "./pages/User/ChangePassUser";
import ChangePassnologin from "./components/User/ChangePassnologin";
import Gioithieu from "./pages/User/Gioithieu";
import Chinhsachbaomat from "./pages/User/Chinhsachbaomat";
import Chinhsachbaohanh from "./pages/User/Chinhsachbaohanh";
import Phuongthucvanchuyen from "./pages/User/Phuongthucvanchuyen";
import ScrollToTop from "./ScrollToTop";

import AdminVoucher from "./pages/Admin/Adminvoucher";
import AdminCate from "./pages/Admin/Admincate";
import AdminCharacteristic from "./pages/Admin/Admincharacteristic";
import AdminTypecate from "./pages/Admin/Admintypecate"
import AdminProduct from "./pages/Admin/Adminproduct";
import AdminReviews from "./pages/Admin/Adminreviews";
import AdminBanner from "./pages/Admin/Adminbanner";
import AdminUser from "./pages/Admin/Adminuser";
import AdminOrder from "./pages/Admin/AdminOrder";
import AdminLevel from "./pages/Admin/AdminLevel";

import ProtectAdmin from "./ProtectAdmin";

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
<UserInfo />
      <Routes>
        {/* Route dành cho User */}
        <Route path="/" element={<> <UserLayout /> </>}>
          <Route index element={<Home />} />
          <Route path="/dangnhap" element={<Login />} />
          <Route path="/dangky" element={<Register />} />
          <Route path="/giohang" element={<Cart />} />
          <Route path="/pr_by_cate/:cate_id" element={<ProductC />} />
          <Route path="/pr_by_typecate/:cate_id" element={<Profcate />} />
          <Route path="/chi_tiet_san_pham/:id" element={<Prdetail />} />
          <Route path="/prlike/:user_id" element={<Favorite_Pr />} />
          <Route path="/xacminh-otp" element={<VerifyOTP />} />
          <Route path="/thanhtoan" element={<Payment />} />
          <Route path="/lienhe" element={<Lienhe />} />
          <Route path="/info" element={<Userprofile />} />
          <Route path="/info_order" element={<OrderUser />} />
          <Route path="/info_changepass" element={<ChangePass />} />
          <Route path="/reset_pass" element={<ChangePassnologin />} />
          <Route path="/check_payment" element={<Checkpayment />} />
          <Route path="/gioithieu" element={<Gioithieu />} />
          <Route path="/chinh_sach_bao_mat" element={<Chinhsachbaomat />} />
          <Route path="/chinh_sach_bao_hanh" element={<Chinhsachbaohanh />} />
          <Route path="/phuong_thuc_van_chuyen" element={<Phuongthucvanchuyen />} />
          
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Route dành cho Admin */}
        <Route path="/admin" element={<> <ProtectAdmin>  <AdminLayout /> </ProtectAdmin>  </> }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="voucher" element={<AdminVoucher />} />
          <Route path="cate" element={<AdminCate />} />
          <Route path="characteristic" element={<AdminCharacteristic />} />
          <Route path="typecate" element={<AdminTypecate />} />
          <Route path="product" element={<AdminProduct />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banner" element={<AdminBanner />} />
          <Route path="account" element={<AdminUser />} />
          <Route path="order" element={<AdminOrder />} />
          <Route path="level" element={<AdminLevel />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;