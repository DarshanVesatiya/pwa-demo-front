import React from "react";

import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import { decrement, increment } from '../../redux/counterSlice'

const OrderList = (): JSX.Element => {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()
  // dispatch(increment()
  return (
    <div>
      Order List
    </div>
  );
}

export default OrderList;
