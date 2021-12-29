import { configureStore } from '@reduxjs/toolkit'

import counterReducer from './counterSlice';
import userReducer from './userSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  // preloadedState: {

  // },
  reducer: {
    cart: cartReducer,
    counter: counterReducer,
    user: userReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch