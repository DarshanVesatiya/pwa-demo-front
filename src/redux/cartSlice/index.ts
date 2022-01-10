import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import { addUpdateCartItems, deleteCartItem } from '../../utility';
import type { RootState } from '../store'

interface cartItem {
  itemId: string;
  qty: number;
  price: number;
}

// Define a type for the slice state
interface cartState {
  items: cartItem[],
  address: string,
  totalAmount: number,
  loading: boolean,
}

// Define the initial state using that type
const initialState: cartState = {
  items: [],
  address: '',
  totalAmount: 0,
  loading: true
}

export const cartSlice = createSlice({
  name: 'cartState',
  initialState,
  reducers: {
    initializeCart: (state, action: PayloadAction<{items: cartItem[], totalAmount: number}>) => {
      state.totalAmount = action.payload.totalAmount;
      state.items = action.payload.items;
      state.loading = false;
    },
    updateCart: (state, action: PayloadAction<{_id: string, price: number}>) => {
      let currentState = JSON.parse(JSON.stringify(current(state)));
      const { _id, price } = action.payload;
      let newItem = true;
      let totalAmount = 0;

      if (currentState.items.length > 0) {
        for(let i = 0; currentState.items.length > i; i++){
          if (currentState.items[i].itemId === _id) {
            newItem = false;
            currentState.items[i].qty += 1;
          }
          totalAmount += parseInt(currentState.items[i].qty) * parseInt(currentState.items[i].price);
        }
      }
      
      if (newItem) {
        currentState.items.push({
          itemId: _id,
          qty: 1,
          price: price
        });
        totalAmount += price;
      }
      state.totalAmount = totalAmount;
      state.items = currentState.items;

      currentState.items.forEach((item: any) => {
        deleteCartItem(item.itemId);
        addUpdateCartItems(item.itemId, item);
      });
      toast.success('Item added in cart!');
    },
    deleteCart: (state, action: PayloadAction<{_id: string}>) => {
      let currentState = JSON.parse(JSON.stringify(current(state)));
      const { _id } = action.payload;
      let totalAmount = 0;

      if (currentState.items.length > 0) {
        for(let i = 0; currentState.items.length > i; i++){
          if (currentState.items[i].itemId !== _id) {
            totalAmount += parseInt(currentState.items[i].qty) * parseInt(currentState.items[i].price);
          } else {
            currentState.items.splice(i, 1);
          }
        }
      }
      state.totalAmount = totalAmount;
      state.items = currentState.items;
      deleteCartItem(_id);
      toast.success('Item removed from the cart');
    },
    updateAddress: (state, action: PayloadAction<{address: string}>) => {
      // console.log(action.payload.address);
      state.address = action.payload.address;
    },
    resetCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
})

export const { initializeCart, updateCart, deleteCart, resetCart, updateAddress } = cartSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const cartInfo = (state: RootState) => state.cart;

export const getCartCount = (state: RootState) => {
  const itemsArr = state.cart.items;
  let qty: number = 0;
  if (itemsArr.length > 0) {
    itemsArr.map((item: cartItem) => {
      qty = qty + item.qty;
    });
  }

  return qty;
};

export default cartSlice.reducer
