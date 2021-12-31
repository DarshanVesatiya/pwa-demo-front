import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderList = (): JSX.Element => {
  const [orderList, setOrderList] = useState([]);
  const { userId } : any = useParams();

  useEffect(() => {
    fetchOrderList()
  }, []);

  const getStatusComp = (status: any) => {
    let component;
    switch(status) {
      case "Accepted": 
        component = <span style={{color: 'greenyellow'}}>{status}</span>
        break;
      case "Preparing": 
        component = <span style={{color: 'blue'}}>{status}</span>
        break;
      case "ReadyToDeliver": 
        component = <span style={{color: 'orange'}}>{status}</span>
        break;
      case "Delivered": 
        component = <span style={{color: 'green'}}>{status}</span>
        break;
      case "Cancelled": 
        component = <span style={{color: 'red'}}>{status}</span>
        break;
      default:
        component = <span>{status}</span>
    }
    return component;
  };

  const fetchOrderList = () => {
    try {
      fetch(`http://localhost:8080/v1/user/${userId}/order-list`)
        .then((response) => response.json())
        .then((...data: any) => {
          setOrderList(data[0].Data);
        })
        .catch();
    } catch (error) {
      
    }
  }

  return (
    <div className="container">
      <table className="table table-hover">
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
                <>No Data Found</>
              )
          }
        </tbody>
      </table>
    </div>
  );
}

export default OrderList;
