import React from 'react'
import styles from'../../styles/User/login.module.css'
import { Link, useNavigate } from 'react-router-dom'
import {useDispatch} from "react-redux"
import {DaLogin} from '../../AuthSlice'
import { useState} from 'react';
import '@ant-design/v5-patch-for-react-19';
import { message } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock,  faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { thoat } from '../../AuthSlice'
export default function FormLogin(){

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const[Err, SetErr] = useState(null)
    const[EmailErr, SetEmailErr] = useState(null)
    const[PasswordErr, SetPasswordErr] = useState(null)

    const em = React.createRef();
    const pw = React.createRef();

    const Login = () => {
        const email = em.current.value;
        const password = pw.current.value;

        if(email === '' && password === ''){
            SetErr("Vui lòng nhập email và mật khẩu")
        }else if( email === '' ){
            SetEmailErr("Vui lòng nhập email")
        }else if( password === '' ){
            SetPasswordErr("Vui lòng nhập email")
        }
        else{
            let url = `${import.meta.env.VITE_API_URL}/dangnhap`;
            let tt = {email, password};
            let opt = {
                method: 'POST', body: JSON.stringify(tt), headers: {'Content-Type': 'application/json'}
            }

            fetch(url, opt).then(res => res.json()).then(
                data =>{
                    if(data.token){
                        dispatch(DaLogin(data));
                        if(data.userInfo.role === 1 && data.userInfo.status === 1){
                            message.success('Bạn đã đăng nhập thành công')
                            navigate('/')
                        }else if(data.userInfo.role === 1 && data.userInfo.status === 2){
                            message.error('Tài khoản của bạn đã bị khóa vui lòng liên hệ Shop để biết thêm thông tin chi tiết');
                            setTimeout(() =>{
                                dispatch(thoat())
                            }, 3000)
                        }
                        else{
                            message.success('Bạn đã đăng nhập thành công')
                            navigate('/admin')
                        }
                    }else{
                        SetErr('Bạn đã nhập sai email hoặc mật khẩu')
                    }
                }
            )
        }
    }



    return(
        <section>
        <div className={styles.Form_login}>
        <div className={styles.container_form_login}>
            <div className={styles.tabs}>
                <Link to={'/dangnhap'} className={styles.active} >Đăng Nhập</Link> 
               <Link to={'/dangky'}>Đăng Ký</Link> 
            </div>
            <h2>Đăng Nhập</h2>
            <p>{Err}</p>
            <form>
                <div className={styles["input-group"]}>
                    <span className={styles.icon}><FontAwesomeIcon icon={faEnvelope} /></span>
                    <input type="email" placeholder="Email" ref={em} required />
                </div>
                <div className={styles["input-group"]}>
                    <span className={styles.icon}><FontAwesomeIcon icon={faLock} /></span>
                    <input type="password" placeholder="Mật khẩu" ref={pw} required />
                </div>
                <button type="button" onClick={() => Login()} className={styles.btn}>Đăng Nhập</button>
            </form>
            <div className={styles.resetpass}>
            <Link to={'/reset_pass'}  >Quên mật khẩu?</Link> 
            </div>
            <p className={styles.linkdk}>Chưa có tài khoản? <Link to={"/dangky"} >Đăng ký ngay.</Link></p>

        </div>
    </div>
    </section>
    )
}