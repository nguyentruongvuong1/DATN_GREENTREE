import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Menu, Search } from "lucide-react";
import axios from "axios";
import "../../styles/Admin/styleadmin.css";
import moment from "moment";
import FormThemSanPham from "../../components/Admin/AdminPr/AdminAddPr";
import UpdatePr from "../../components/Admin/AdminPr/AdminUpdatePr";
import { useSelector } from "react-redux";

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Số sản phẩm mỗi trang
  const [totalProducts, setTotalProducts] = useState(0);

  const [allPr, setallPr] = useState([]); // Tất cả sản phẩm để tìm kiếm
  const [search, setsearch] = useState(""); // Trạng thái tìm kiếm
  const [prfilter, ganprfilter] = useState([]); // Trạng thái tìm kiếm
  const [sortPr, SetsortPr] = useState("create_date");

  const [modeladd, setmodeladd] = useState(false);
  const [modelupdate, setmodelupdate] = useState(false);
  const [UpdateId, setUpdateId] = useState(null);
  
  const user = useSelector((state) => state.auth.user)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/adminpr/products?sort=${sortPr}&page=${currentPage}&limit=${itemsPerPage}`
        );
        const response = await products.json();
        setProducts(response.products || response);
        setTotalProducts(response.total || response.length);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchData();
  }, [currentPage, itemsPerPage, sortPr]);

  useEffect(() => {
    const fetchadllData = async () => {
      try {
        const products = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/adminpr/allproducts`
        );
        const response = await products.json();
        setallPr(response.products || response); // gán allPr với dữ liệu sản phẩm
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchadllData();
  }, []);
  

  useEffect(() => {
    if (search === "") {
      ganprfilter(products);
    } else {
      const FilterPr = allPr.filter((pr) =>
        pr.name.toLowerCase().includes(search.toLowerCase())
      );
      ganprfilter(FilterPr);
    }
  }, [search, allPr, products]);

  const onchangeSearch = (e) => {
    setsearch(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, page)); // Đảm bảo trang nhỏ nhất là 1
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/adminpr/product/${id}`
        );
        alert("Xóa sản phẩm thành công!");
        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    }
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="toggle">
        </div>
        <div className="search">
          <label>
            <input
              type="text"
              value={search}
              onChange={onchangeSearch}
              placeholder="Tìm kiếm..."
            />{" "}
          </label>
        </div>
        <div className="user">
        <img src={user.avatar} alt="User" />
        </div>
      </div>
      <div className="details">
        <div className="recentOrders">
          <div className="cardHeader">
            <h2>Danh sách sản phẩm</h2>
            <button className="buttonAdd" onClick={() => setmodeladd(true)}>
              Thêm Sản Phẩm
            </button>
          </div>
          <div className="sxpr">
            <select onChange={(e) => SetsortPr(e.target.value)}>
              <option value="create_date">
                Sắp xếp theo sản phẩm mới nhất
              </option>
              <option value="price_asc">Sắp xếp theo giá tăng dần</option>
              <option value="price_desc">Sắp xếp theo giá giảm dần</option>
              <option value="view">Sắp xếp theo mức độ phổ biến</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Giảm giá</th>
                <th>Giá sau giảm</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                prfilter.map((product, index) => (
                  <tr key={`${product.id}-${index}`}>
                    <td>{product.id}</td>
                    <td>
                      <img
                        src={product.images?.split(",")[0]}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td>{product.name.length > 30 ? product.name.slice(0, 30) + '...' : product.name}</td>
                    <td>{product.category_name}</td>
                    <td>{Number(product.price).toLocaleString('vi')}</td>
                    <td>{Number(product.sale).toLocaleString('vi')}%</td>
                    <td>{Number(product.price_sale).toLocaleString('vi')}</td>
                    <td>{product.inventory_quantity}</td>
                    <td>{product.status === 0 ? "Ẩn" : "Hiện"}</td>
                    <td>{moment(product.create_date).format("DD-MM-YYYY")}</td>
                    <td>
                      <button
                        onClick={() => {
                          setmodelupdate(true);
                          setUpdateId(product.id);
                        }}
                      >
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(product.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center" }}>
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalProducts > itemsPerPage && (
            <div className="paginationContainer">
              <ReactPaginate
                breakLabel="⋯"
                nextLabel=">"
                previousLabel="<"
                onPageChange={(selectedItem) =>
                  handlePageChange(selectedItem.selected + 1)
                }
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
                pageCount={Math.ceil(totalProducts / itemsPerPage)}
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
                  Math.ceil(totalProducts / itemsPerPage) - 1
                )}
              />
            </div>
          )}
        </div>
      </div>
      {modeladd && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setmodeladd(false)}
          ></div>
          <div className="modal-containerpr">
            <FormThemSanPham />
          </div>
        </>
      )}

      {modelupdate &&  (
        <>
          <div
            className="modal-overlay"
            onClick={() => setmodelupdate(false)}
          ></div>
          <div className="modal-containerpr">
            <UpdatePr id={UpdateId} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProduct;
