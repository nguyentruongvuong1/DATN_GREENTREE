import React, { useState, useEffect } from "react";
import { Menu, Search } from "lucide-react";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "../../styles/Admin/styleadmin.css";
import { Link } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";



const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [totalReviews, setTotalReviews] = useState(0);

    const [allRv, setallRv] = useState([]); // Tất cả để tìm kiếm
    const [search, setsearch] = useState(''); // Trạng thái tìm kiếm
    const [rvfilter, ganrvfilter] = useState([]) // Trạng thái tìm kiếm
    const token = useSelector((state) => state.auth.token)


    useEffect(() => {
        fetchReviews();
    }, [currentPage, token]);

    const fetchReviews = async () => {
        try {
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reviews?page=${currentPage}&limit=${itemsPerPage}`, otp);
            setReviews(response.data.comments || response.data);
            setTotalReviews(response.data.total || response.data.length);
            console.log(response.data);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu bình luận:", error);
        }
    };

    useEffect(() => {
        const fetchallReviews = async () => {
            try {
                const otp = {
                    headers: {
                        "Content-Type": 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                }
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/allreviews`, otp);
                setallRv(response.data.comments || response.data); // gán allRv với dữ liệu reviews
                console.log(response.data);
    
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu bình luận:", error);
            }
        };
        fetchallReviews();
    }, [token])       



    const onchangeSearch = (e) => {
        setsearch(e.target.value)
    }

    useEffect(() => {
        if (search === '') {
            ganrvfilter(reviews)
        } else {
            const FilterRv = allRv.filter(rv => rv.user_name.toLowerCase().includes(search.toLowerCase()))
            ganrvfilter(FilterRv)
        }

    }, [search, allRv, reviews])


    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected + 1);
    };

    const DeleteReviews = async (id) =>{
        const hoi = confirm(`Bạn có chắc muốn xóa đánh giá này không`)
        
        if(hoi){
            const otp = {
                headers: {
                    "Content-Type": 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
            try{
             await axios.delete(`${import.meta.env.VITE_API_URL}/admin/reviews/${id}`, otp)
             message.success('Xóa đánh giá thành công.')
             setTimeout(() =>{
                window.location.reload();
             },1000)   

            }catch(err){
                console.log('Lỗi xóa', err)
            }
        }else{
            return;
        }
       
    }

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
                            onChange={onchangeSearch} placeholder="Tìm kiếm..."

                        />                        <Search size={24} />
                    </label>
                </div>
                <div className="user">
                    <img src="/images/user.jpg" alt="User" />
                </div>
            </div>
            <div className="details">
                <div className="recentOrders">
                    <div className="cardHeader">
                        <h2>Quản Lý Đánh Giá</h2>
                    </div>
                    <table className="comment-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Người Dùng</th>
                                <th>Sản Phẩm</th>
                                <th>Nội dung</th>
                                <th>Số Sao</th>
                                <th>Ngày bình luận</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rvfilter.map((review, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{review.user_name}</td>
                                    <td>{review.product_name.length > 20 ? review.product_name.slice(0, 20) + '...' : review.product_name}</td>
                                    <td width={'200px'}>{review.content}</td>
                                    <td>{review.star}</td>
                                    <td>{moment(review.create_date).format(' DD-MM-YYYY')}</td>
                                    <td>
                                        <button className="xemdanhgia" >
                                            <Link to={`/chi_tiet_san_pham/${review.pr_id}#reviews`} >
                                                Xem đánh giá
                                            </Link>
                                        </button>       
                                        <button onClick={() => DeleteReviews(review.id)}>Xóa</button>                            
                                         </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalReviews > itemsPerPage && (
                        <div className="paginationContainer">
                            <ReactPaginate
                                breakLabel="⋯"
                                nextLabel=">"
                                previousLabel="<"
                                onPageChange={handlePageChange}
                                pageRangeDisplayed={2}
                                marginPagesDisplayed={1}
                                pageCount={Math.ceil(totalReviews / itemsPerPage)}
                                containerClassName="pagination"
                                pageClassName="pageItem"
                                pageLinkClassName="pageLink"
                                previousClassName="pageItem"
                                previousLinkClassName="pageLink previousLink"
                                nextClassName="pageItem"
                                nextLinkClassName="pageLink nextLink"
                                activeClassName="active"
                                breakClassName="breakItem"
                                forcePage={Math.min(Math.max(0, currentPage - 1), Math.ceil(totalReviews / itemsPerPage) - 1)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
