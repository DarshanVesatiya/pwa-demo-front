import { createSlice, PayloadAction, current } from '@reduxjs/toolkit'
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
  address: '',
  totalAmount: 0
}

export const cartSlice = createSlice({
  name: 'cartState',
  initialState,
  reducers: {
    updateCart: (state, action: PayloadAction<{_id: string, price: number}>) => {
      let currentState = JSON.parse(JSON.stringify(current(state)));
      console.log('currentState ======> ', currentState);
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
          console.log('totalAmount1 =====> ', totalAmount);
        }
      }
      
      if (newItem) {
        currentState.items.push({
          itemId: _id,
          qty: 1,
          price: price
        });
        totalAmount += price;
        console.log('totalAmount2 =====> ', totalAmount);
      }
      state.totalAmount = totalAmount;
      state.items = currentState.items;
      
    }
    // increment: (state) => {
    //   state.value += 1
    // },
    // decrement: (state) => {
    //   state.value -= 1
    // },
    // // Use the PayloadAction type to declare the contents of `action.payload`
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload
    // },
  },
})

export const { updateCart } = cartSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const cartInfo = (state: RootState) => state.cart;

export default cartSlice.reducer
