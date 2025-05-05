import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";
import '../styles/User/mobile.css'
export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [cate, setcate] = useState([])
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const [product, setproduct] = useState([]);
    const [searchpr, setsearchpr] = useState("");
    const [prfilter, setprfilter] = useState([]);
    const [isInputFocused, setInputFocused] = useState(false);


      // Fetch danh mục
      useEffect(() => {
        fetch("http://localhost:3000/c/cate")
          .then((res) => res.json())
          .then((data) => setcate(data));
      }, []); 

       useEffect(() => {
          fetch(`${import.meta.env.VITE_API_URL}/pr/pr`)
            .then((res) => res.json())
            .then((data) => setproduct(data));
        }, []);

        const onchangeSearch = (e) => {
            setsearchpr(e.target.value);
          };
        
          useEffect(() => {
            if (searchpr === "") {
              setprfilter("");
            } else {
              const Filterpr = product.filter((pr) =>
                pr.name.toLowerCase().includes(searchpr.toLowerCase())
              );
              setprfilter(Filterpr);
            }
          }, [product, searchpr]);

     

    return (
        <>
            {/* Nút mở menu */}
            <div className="menu-icon" onClick={toggleMenu}>
                ☰
            </div>

            {/* Overlay khi menu mở */}
            {isOpen && <div className="overlay" onClick={toggleMenu}></div>}

            {/* Menu ẩn */}
            <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
                <span className="close-menu" onClick={toggleMenu}>✖</span>

                <div className='searchBox'>
                            <div className='searchicon'>
                            <input
                              type="text"
                              placeholder="Tìm kiếm sản phẩm..."
                              className='searchInput'
                              value={searchpr}
                              onChange={onchangeSearch}
                              onFocus={() => setInputFocused(true)}
                              onBlur={() => setInputFocused(false)}
                            />
                                  <FontAwesomeIcon icon={faMagnifyingGlass} className='searchicon_icon' />
                                  </div>
                
                <div className='pr_search_container'>
                            {searchpr && prfilter.length > 0
                              ? prfilter.map((pr, index) => (
                                  <div key={index} className='pr_search'>
                                    <div className='pr_search_img'>
                                      <img src={pr.images.split(",")[0]} alt="" />
                                    </div>
                                    <div className='pr_search_info'>
                                      <Link to={`/chi_tiet_san_pham/${pr.id}`}>
                                      <p>{pr.name}</p>
                                      <p>{pr.price}</p>
                                      </Link>
                                    </div>
                                  </div>
                                ))
                              : searchpr &&
                                isInputFocused && <div>Sản phẩm này không tồn tại </div>}
                          </div>
                          </div>

                {cate.map((c, index) =>(
                <div className="menumini" key={index} >
                    <Link to={`/pr_by_cate/${c.id}`}>{c.name}</Link>
                    
                </div>
                ))}
               
             
            </div>

            
        </>
    );
}
