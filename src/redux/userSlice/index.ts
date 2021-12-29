import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface UserState {
  firstName: string,
  lastName: string,
  mobileNumber: string,
}

// Define the initial state using that type
const initialState: UserState = {
  firstName: '',
  lastName: '',
  mobileNumber: '',
}

export const userSlice = createSlice({
  name: 'userState',
  initialState,
  reducers: {
    updateInfo: (state, action: PayloadAction<number>) => {
      // state = action.payload
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

export const { updateInfo } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const userInfo = (state: RootState) => state.user;

export default userSlice.reducer