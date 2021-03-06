import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderList = (): JSX.Element => {
  const [orderList, setOrderList] = useState([]);
  const { userId }: any = useParams();
  const [isFetchingOn, setFetchingOn] = useState(false);

  useEffect(() => {
    fetchOrderList()
  }, []);

  const getStatusComp = (status: any) => {
    let component;
    switch (status) {
      case "Accepted":
        component = <span style={{ color: 'greenyellow' }}>{status}</span>
        break;
      case "Preparing":
        component = <span style={{ color: 'blue' }}>{status}</span>
        break;
      case "ReadyToDeliver":
        component = <span style={{ color: 'orange' }}>{status}</span>
        break;
      case "Delivered":
        component = <span style={{ color: 'green' }}>{status}</span>
        break;
      case "Cancelled":
        component = <span style={{ color: 'red' }}>{status}</span>
        break;
      default:
        component = <span>{status}</span>
    }
    return component;
  };

  const fetchOrderList = () => {
    try {
      setFetchingOn(true);
      fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/user/${userId}/order-list`)
        .then((response) => response.json())
        .then((...data: any) => {
          setOrderList(data[0].Data);
          setFetchingOn(false);
        })
        .catch(() => {
          setFetchingOn(false);
        });
    } catch (error) {
      setFetchingOn(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        {isFetchingOn ? (
          <div className="loaderBox"><div className="loader"></div></div>
        ) : (
          <div className="table-responsive orderListItems ">
            <table className="table table-hover responsiveTable">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Order Id</th>
                  <th scope="col">Order Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total amount</th>
                  <th scope="col">Location</th>
                </tr>
              </thead>
              <tbody>
                {
                  orderList.length
                    ? (
                      <>
                        {
                          orderList.map((order: any, index) => (
                            <tr>
                              <th scope="row">{index + 1}</th>
                              <td>{order._id}</td>
                              <td>{new Date(order.date).toLocaleString()}</td>
                              <td>{getStatusComp(order.status)}</td>
                              <td>{order.totalAmount}</td>
                              <td>{order.address}</td>
                            </tr>
                          ))
                        }
                      </>
                    )
                    : (
                      <><tr><td className="p-5 text-center" colSpan={6}>No Data Found</td></tr></>
                    )
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderList;
