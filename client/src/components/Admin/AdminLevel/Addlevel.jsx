import { useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import { useSelector } from "react-redux";
export default function Addlevel() {
    const token = useSelector((state) => state.auth.token)
    const [addlevel, setaddlevel] = useState({
        rank: '',
        total_buy: '',
        discount_value: ''
    })

    const valueChange = (e) =>{
        const {name, value} = e.target;
        setaddlevel((prev) =>(
            {
                ...prev,
                [name]: value,
            }
        ))
    }

    const Addlevelnew = async (e) =>{
        e.preventDefault();
        try{
            if(addlevel.rank === '' && addlevel.total_buy === '' && addlevel.discount_value === ''){
                message.error('Vui lòng nhập đầy đủ thông tin')
            }
            else{
                const otp = {
                    method: "POST",
                    body: JSON.stringify(addlevel),
                    headers: {
                        "Content-Type": 'application/json',
                        'Authorization': 'Bearer ' + token
                      }
                }
                const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/level`, otp)
                if(res.ok){
                    message.success('Thêm bậc thành công');
                    setaddlevel({
                        rank: '',
                        total_buy: '',
                        discount_value: ''
                    })
                }else{
                    message.error('Thêm bậc thất bại')
                }
            }
        }catch(error){
            console.log('Lỗi thêm bậc', error)
        }
    }

  return (
    <div className="form-wrapper">
      <h2>Thêm Bậc</h2>
      <form onSubmit={Addlevelnew}>
        <div className="form-group">
          <label>Tên bậc:</label>
          <input className="form-control" type="text" name="rank" value={addlevel.rank} onChange={valueChange} required />
        </div>

        <div className="form-group">
          <label>Tổng tiền:</label>
          <input className="form-control" type="number" value={addlevel.total_buy} onChange={valueChange} name="total_buy" required />
        </div>

        <div className="form-group">
          <label>Giá trị giảm (%):</label>
          <input
            className="form-control"
            type="number"
            name="discount_value"
            min={0}
            max={100}
            value={addlevel.discount_value} onChange={valueChange}
            required
          />
        </div>

        <button className="submit-btn" type="submit">
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
}
