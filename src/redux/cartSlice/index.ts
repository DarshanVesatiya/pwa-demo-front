import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';

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
}

// Define the initial state using that type
const initialState: cartState = {
  items: [],
  address: 'Test Set 42 at Test Stadium',
  totalAmount: 0
}

export const cartSlice = createSlice({
  name: 'cartState',
  initialState,
  reducers: {
    initializeCart: (state, action: PayloadAction<{items: cartItem[], totalAmount: number}>) => {
      state.totalAmount = action.payload.totalAmount;
      state.items = action.payload.items;
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
          totalAmount += currentState.items[i].qty * currentState.items[i].price;
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

    },
    deleteCart: (state, action: PayloadAction<{_id: string}>) => {
      deleteCartItem(action.payload._id);
    },
    resetCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    }
  },
})

export const { initializeCart, updateCart, deleteCart, resetCart } = cartSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const cartInfo = (state: RootState) => state.cart;

export default cartSlice.reducer
