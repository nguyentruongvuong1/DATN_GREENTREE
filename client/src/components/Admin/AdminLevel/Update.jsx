import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { useSelector } from "react-redux";

export default function Updatelevel({id}) {
    const token = useSelector((state) => state.auth.token)
    const [updatelevel, setupdatelevel] = useState({
        rank: '',
        total_buy: '',
        discount_value: ''
      });

      useEffect(() => {
        const otp = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        fetch(`${import.meta.env.VITE_API_URL}/admin/level/${id}`, otp)
          .then((res) => res.json())
          .then((data) => {
            setupdatelevel({
              rank: data.rank || '',
              total_buy: data.total_buy || '',
              discount_value: data.discount_value || ''
            });
          });
      }, [token, id]);

    const valueChange = (e) =>{
        const {name, value} = e.target;
        setupdatelevel((prev) =>(
            {
                ...prev,
                [name]: value,
            }
        ))
    }

    const Updatelevel = async (e) =>{
        e.preventDefault();
        try{
            if(updatelevel.rank === '' && updatelevel.total_buy === '' && updatelevel.discount_value === ''){
                message.error('Vui lòng nhập đầy đủ thông tin')
            }
            else{
                const otp = {
                    method: "PUT",
                    body: JSON.stringify(updatelevel),
                    headers: {
                        "Content-Type": 'application/json',
                        'Authorization': 'Bearer ' + token
                      }
                }
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/level/${id}`, otp)
                if(res.ok){
                    message.success('Cập nhật bậc thành công');
                }else{
                    message.error('Cập nhật bậc thất bại')
                }
            }
        }catch(error){
            console.log('Lỗi Cập nhật bậc', error)
        }
    }

  return (
    <div className="form-wrapper">
      <h2>Thêm Bậc</h2>
      <form onSubmit={Updatelevel}>
        <div className="form-group">
          <label>Tên bậc:</label>
          <input className="form-control" type="text" name="rank" value={updatelevel?.rank} onChange={valueChange} required />
        </div>

        <div className="form-group">
          <label>Tổng tiền:</label>
          <input className="form-control" type="number" value={updatelevel?.total_buy} onChange={valueChange} name="total_buy" required />
        </div>

        <div className="form-group">
          <label>Giá trị giảm (%):</label>
          <input
            className="form-control"
            type="number"
            name="discount_value"
            min={0}
            max={100}
            value={updatelevel?.discount_value} onChange={valueChange}
            required
          />
        </div>

        <button className="submit-btn" type="submit">
          Cập nhật bậc
        </button>
      </form>
    </div>
  );
}
