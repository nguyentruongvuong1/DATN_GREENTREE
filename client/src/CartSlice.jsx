import {createSlice} from '@reduxjs/toolkit';

const saveCart = (cartState) =>{
    localStorage.setItem('cart', JSON.stringify(cartState));
};

const loadCartFromLocalStorage = () =>{
    try {
        const cart = localStorage.getItem('cart');
        if(cart === null) return { listPr: [], voucher: {} };
        return JSON.parse(cart);
    } catch(err) {
        console.error("Failed to load cart from localStorage:", err);
        return { listPr: [], voucher: {} };
    }
};

const initialState = {listPr: loadCartFromLocalStorage().listPr || [], voucher: loadCartFromLocalStorage().voucher || null };

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        themPr: (state, action) => {
            const pr = action.payload;
            const index = state.listPr.findIndex(p => p.id === pr.id);
            if (index === -1) {
                state.listPr.push({ ...pr, so_luong: pr.so_luong || 1 });
            } else {
                state.listPr[index].so_luong += pr.so_luong || 1;
            }
            saveCart(state);
        },

        SuaSL: (state, action) =>{
            const [id, so_luong] = action.payload;
            const index = state.listPr.findIndex(p => p.id === id);
            if(index !== -1){
                state.listPr[index].so_luong = Number(so_luong);
                saveCart(state);
            }
        },

        XoaPr: (state, action) =>{
            const id = action.payload;
            const index = state.listPr.findIndex(p => p.id === id);
            if(index !== -1){
                state.listPr.splice(index, 1);
                saveCart(state);
            }
        },

        ApDungVoucher: (state, action) => {
            state.voucher = action.payload;  
            saveCart(state);
        },
        
        XoaVoucher: (state) => {
            state.voucher = null;
            saveCart(state);
        },

        XoaGH: (state) =>{
            state.listPr = [];
            state.voucher = null;
            saveCart(state)
        },

        
    }
})


export const {themPr, SuaSL, XoaGH, XoaPr, ApDungVoucher, XoaVoucher} = cartSlice.actions
export default cartSlice.reducer;