import React from "react";

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { updateCart } from "../../redux/cartSlice";

const Checkout = (): JSX.Element => {
  const cartInfo = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  console.log("cartInfo ==========> ", cartInfo);

  return (
    <div className="container">
      <div className="contentbar">
        <div className="row">
          <div className="col-md-12 col-lg-12 col-xl-12">
            <div className="card m-b-30">
              <div className="card-header">
                <h5 className="card-title">Cart</h5>
              </div>
              <div className="card-body">
                <div className="row justify-content-center">
                  <div className="col-lg-10 col-xl-8">
                    <div className="cart-container">
                      <div className="cart-head">
                        <div className="table-responsive">
                          <table className="table table-borderless">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Action</th>
                                <th scope="col">Photo</th>
                                <th scope="col">Product</th>
                                <th scope="col">Qty</th>
                                <th scope="col">Price</th>
                                <th scope="col" className="text-right">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope="row">1</th>
                                <td>
                                  <a href="#" className="text-danger">
                                    <i className="ri-delete-bin-3-line"></i>
                                  </a>
                                </td>
                                <td>
                                  <img
                                    src="https://themesbox.in/admin-templates/olian/html/light-vertical/assets/images/ecommerce/product_01.svg"
                                    className="img-fluid"
                                    width="35"
                                    alt="product"
                                  />
                                </td>
                                <td>Apple Watch</td>
                                <td>
                                  <div className="form-group mb-0">
                                    <input
                                      type="number"
                                      className="form-control cart-qty"
                                      name="cartQty1"
                                      id="cartQty1"
                                      value="1"
                                    />
                                  </div>
                                </td>
                                <td>$10</td>
                                <td className="text-right">$500</td>
                              </tr>
                              <tr>
                                <th scope="row">2</th>
                                <td>
                                  <a href="#" className="text-danger">
                                    <i className="ri-delete-bin-3-line"></i>
                                  </a>
                                </td>
                                <td>
                                  <img
                                    src="https://themesbox.in/admin-templates/olian/html/light-vertical/assets/images/ecommerce/product_02.svg"
                                    className="img-fluid"
                                    width="35"
                                    alt="product"
                                  />
                                </td>
                                <td>Apple iPhone</td>
                                <td>
                                  <div className="form-group mb-0">
                                    <input
                                      type="number"
                                      className="form-control cart-qty"
                                      name="cartQty2"
                                      id="cartQty2"
                                      value="1"
                                    />
                                  </div>
                                </td>
                                <td>$20</td>
                                <td className="text-right">$200</td>
                              </tr>
                              <tr>
                                <th scope="row">3</th>
                                <td>
                                  <a href="#" className="text-danger">
                                    <i className="ri-delete-bin-3-line"></i>
                                  </a>
                                </td>
                                <td>
                                  <img
                                    src="https://themesbox.in/admin-templates/olian/html/light-vertical/assets/images/ecommerce/product_03.svg"
                                    className="img-fluid"
                                    width="35"
                                    alt="product"
                                  />
                                </td>
                                <td>Apple iPad</td>
                                <td>
                                  <div className="form-group mb-0">
                                    <input
                                      type="number"
                                      className="form-control cart-qty"
                                      name="cartQty3"
                                      id="cartQty3"
                                      value="1"
                                    />
                                  </div>
                                </td>
                                <td>$30</td>
                                <td className="text-right">$300</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="cart-body">
                        <div className="row">
                          <div className="col-md-12 order-2 order-lg-1 col-lg-5 col-xl-6">
                            <div className="order-note">
                              {/* <form>
                                <div className="form-group">
                                  <div className="input-group">
                                    <input
                                      type="search"
                                      className="form-control"
                                      placeholder="Coupon Code"
                                      aria-label="Search"
                                      aria-describedby="button-addonTags"
                                    />
                                    <div className="input-group-append">
                                      <button
                                        className="input-group-text"
                                        type="submit"
                                        id="button-addonTags"
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Special Note for this order:</label>
                                  <textarea
                                    className="form-control"
                                    name="specialNotes"
                                    id="specialNotes"
                                    placeholder="Message here"
                                  ></textarea>
                                </div>
                              </form> */}
                            </div>
                          </div>
                          <div className="col-md-12 order-1 order-lg-2 col-lg-7 col-xl-6">
                            <div className="order-total table-responsive ">
                              <table className="table table-borderless text-right">
                                <tbody>
                                  <tr>
                                    <td>Sub Total :</td>
                                    <td>$1000.00</td>
                                  </tr>
                                  <tr>
                                    <td>Shipping :</td>
                                    <td>$0.00</td>
                                  </tr>
                                  <tr>
                                    <td>Tax(18%) :</td>
                                    <td>$180.00</td>
                                  </tr>
                                  <tr>
                                    <td className="f-w-7 font-18">
                                      <h4>Amount :</h4>
                                    </td>
                                    <td className="f-w-7 font-18">
                                      <h4>$1180.00</h4>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="cart-footer text-right">
                        <button type="button" className="btn btn-info my-1">
                          <i className="ri-save-line mr-2"></i>Update Cart
                        </button>
                        <a
                          href="page-checkout.html"
                          className="btn btn-success my-1"
                        >
                          Proceed to Checkout
                          <i className="ri-arrow-right-line ml-2"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
