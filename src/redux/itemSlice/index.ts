import { createSlice, PayloadAction, current } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface itemInterface {
  _id: string;
  name: string;
  price: number;
  image: string;
}

// Define a type for the slice state
interface itemState {
  items: {[key: string]: itemInterface},
  loading: boolean,
}

// Define the initial state using that type
const initialState: itemState = {
  items: {},
  loading: true
}

export const itemSlice = createSlice({
  name: 'itemState',
  initialState,
  reducers: {
    addList: (state, action: PayloadAction<{items: []}>) => {
      let arr: {[key: string]: itemInterface} = {};
      action.payload.items.forEach((item: itemInterface) => {
        arr[item._id] = item;
      });
      state.items = arr;
      state.loading = false;
    }
  },
});

export const { addList } = itemSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const itemInfo = (state: RootState) => state.items;

export default itemSlice.reducer

