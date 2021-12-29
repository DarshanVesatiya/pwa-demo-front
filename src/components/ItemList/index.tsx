import React, { useEffect, useState } from 'react'

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateCart } from '../../redux/cartSlice';

interface IItem {
  _id: string;
  name: string;
  image: string;
  price: number;
}

const Item = ({
  _id,
  name,
  image,
  price
}: IItem) => {
  const dispatch = useAppDispatch();

  const addToCart = (_id: string, price: number) => {
    dispatch(updateCart({_id, price}));
  }

  return (
    <Card className="mb-4">
      <Card.Img className="cardImage" variant="top" src={image} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Subtitle>${price}</Card.Subtitle>
        <Card.Text>
          Some quick example text to build on the card title and make up the bulk of
          the card's content.
        </Card.Text>
        <Button variant="primary" onClick={() => addToCart(_id, price)}>Add To Cart</Button>
      </Card.Body>
    </Card>
  );
}

const ItemList = () => {
  const [listData, setListData] = useState([]);
  useEffect(() => {
    fetchList()
  }, []);

  const fetchList = () => {
    try {
      fetch('http://localhost:8081/items').
      then((response) => response.json())
      .then((...data: any) => {
        setListData(data[0]);
      })
      .catch();
    } catch (error) {
      
    }
  }

  return (
    <div>
      <Row xs={1} sm={2} md={3} lg={5}>
        {listData.length ? (
          <>
            {listData.map((listItem) => <Col><Item {...listItem} /></Col>)}
          </>
        ) : (
          <>No Data Found</>
        )}
      </Row>
    </div>
  )
}

export default ItemList;
