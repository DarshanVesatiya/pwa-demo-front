import React, { useState } from "react";
import { toast } from 'react-toastify';

import { Camera } from '../../components/Camera';
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { deleteCart, resetCart, updateAddress } from "../../redux/cartSlice";
import { getCartItems, deleteCartItem, addSyncUpdateCartItems } from '../../utility';
import { Button } from "react-bootstrap";

const Checkout = (): JSX.Element => {
  const [show, setShow] = useState(false);
  const cartInfo = useAppSelector((state) => state.cart);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const cartAddress = useAppSelector((state) => state.cart.address);
  const itemsList = useAppSelector((state) => state.items.items);
  const itemsListLoading = useAppSelector((state) => state.items.loading);
  const userId = useAppSelector((state) => state.user._id);

  const dispatch = useAppDispatch();

  const completeCheckout = () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      addSyncUpdateCartItems('1', { cartId: 1, info: {userId: userId, ...cartInfo} }).then(() => {
        navigator.serviceWorker.ready.then((registration: any) => {
          registration.sync.register('sync-cart');
          toast.info('Order Send for Sync');
        })
      });
    } else {
      let itemsArr: any = [];
      cartInfo.items.map((ele) => {
        itemsArr.push({
          itemId: ele.itemId,
          quantity: ele.qty
        });
      });
      const data = {
        items: itemsArr,
        totalAmount: cartInfo.totalAmount,
        status: "Accepted",
        address: cartInfo.address
      }

      fetch(`http://localhost:8080/v1/user/${userId}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      }).
      then((response) => response.json())
      .then(() => {
        dispatch(resetCart());
        getCartItems().then((data) => {
          if(data.length) {
            data.forEach((item) => {
              deleteCartItem(item.itemId);
            });
          }
        });
        toast.success('Order Placed Successfully');
      })
      .catch(() => {
        // issue with place order show error toast
        toast.success('Issue In Placing Order!');
      });
    }
  }
  
  // console.log('cartInfo.items ========> ', cartInfo);
  return (
    <div className="container">
      <div className="contentbar">
        <div className="row">
          <div className="col-md-12 col-lg-12 col-xl-12">
            <div className="card m-b-30">
              <div className="card-header">
                <h5 className="card-title">Cart</h5>
              </div>
              {itemsListLoading ? (
                <>Loading...</>
              ) : (
                <div className="card-body">
                  <div className="row justify-content-center">
                    <div className="col-xl-12">
                      <div className="cart-container">
                        {cartLoading ? (
                          <>Loading...</>
                        ) : (
                          <>
                            {cartInfo.items.length > 0 ? (
                              <>
                                <div className="cart-head">
                                  <div className="table-responsive">
                                    <table className="table table-borderless">
                                      <thead>
                                        <tr>
                                          <th scope="col">#</th>
                                          
                                          <th scope="col">Photo</th>
                                          <th scope="col">Product</th>
                                          <th scope="col">Qty</th>
                                          <th scope="col">Price</th>
                                          <th scope="col" className="text-right">
                                            Total
                                          </th>
                                          <th scope="col"  style={{ "textAlign": "center" }}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cartInfo.items.map((cartItem, index) => {
                                          return (
                                            <tr>
                                              <th scope="row">
                                                {index + 1}
                                              </th>
                                              
                                              <td>
                                                <img
                                                  src={itemsList[cartItem.itemId]?.image}
                                                  className="img-fluid border p-1 border-1 rounded"
                                                  style={{ "width": "100px", "height": "100px" }}
                                                  alt="product"
                                                />
                                              </td>
                                              <td>
                                                {itemsList[cartItem.itemId]?.name}
                                              </td>
                                              <td>
                                                <div className="form-group mb-0">
                                                  {cartItem.qty}
                                                </div>
                                              </td>
                                              <td>
                                                ${cartItem.price}
                                              </td>
                                              <td className="text-right">
                                                ${cartItem.qty * cartItem.price}
                                              </td>
                                              <td style={{ "textAlign": "center" }}>
                                                <a onClick={() => { dispatch(deleteCart({ _id: cartItem.itemId })) }} className="text-danger">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                  </svg>
                                                </a>
                                              </td>
                                            </tr>
                                          );
                                      })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <div className="cart-body">
                                  <div className="row">
                                    <div className="col-md-12 order-2 order-lg-1 col-lg-5 col-xl-8">
                                      <div className="order-note">
                                        <>
                                          <div className="form-group">
                                            <div className="input-group">
                                              <input
                                                type="search"
                                                className="form-control"
                                                placeholder="Address"
                                                value={cartAddress}
                                                aria-label="Search"
                                                aria-describedby="button-addonTags"
                                                onChange={(event) => dispatch(updateAddress({address: event.target.value})) }
                                              />
                                              <div className="input-group-append">
                                                <Camera show={show} setShow={setShow} />
                                                <button
                                                  className="input-group-text"
                                                  type="button"
                                                  onClick={() => setShow(true)}
                                                  id="button-addonTags"
                                                >
                                                  Scan QR Code
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                          {/* <div className="form-group">
                                            <label>Special Note for this order:</label>
                                            <textarea
                                              className="form-control"
                                              name="specialNotes"
                                              id="specialNotes"
                                              placeholder="Message here"
                                            ></textarea>
                                          </div> */}
                                        </>
                                      </div>
                                    </div>
                                    <div className="col-md-12 order-1 order-lg-2 col-lg-7 col-xl-4">
                                      <div className="order-total table-responsive ">
                                        <table className="table table-borderless text-right">
                                          <tbody>
                                            <tr>
                                              <td>Sub Total :</td>
                                              <td>${cartInfo.totalAmount}</td>
                                            </tr>
                                            <tr>
                                              <td>Shipping :</td>
                                              <td>$0.00</td>
                                            </tr>
                                            {/* <tr>
                                              <td>Tax(18%) :</td>
                                              <td>$180.00</td>
                                            </tr> */}
                                            <tr>
                                              <td className="f-w-7 font-18">
                                                <h4>Amount :</h4>
                                              </td>
                                              <td className="f-w-7 font-18">
                                                <h4>${cartInfo.totalAmount}</h4>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="cart-footer float-end">
                                  {/* <button type="button" className="btn btn-info my-1">
                                    <i className="ri-save-line mr-2"></i>Update Cart
                                  </button> */}
                                  {cartAddress !== '' ? (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      
                                      onClick={completeCheckout}
                                    >
                                      Complete Payment
                                      <i className="ri-arrow-right-line ml-2"></i>
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      disabled
                                    >
                                      Complete Payment
                                      <i className="ri-arrow-right-line ml-2"></i>
                                    </Button>
                                  )}
                                  
                                </div>
                              </>
                            ) : (
                              <>
                                No Items in Cart
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
