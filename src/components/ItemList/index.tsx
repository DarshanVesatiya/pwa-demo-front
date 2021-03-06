import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateCart } from '../../redux/cartSlice';
import { Container } from 'react-bootstrap';

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
        <h6 className='mb-4'>{name}</h6>
        <Card.Subtitle className='mb-2 font-bold '>${price}</Card.Subtitle>
        <Card.Text className="mb-4">
          Some quick example text to build on the card title and make up the bulk of
          the card's content.
        </Card.Text>
        <Button variant="outline-primary" size="sm" onClick={() => addToCart(_id, +price)}>Add To Cart</Button>
      </Card.Body>
    </Card>
  );
}

const ItemList = () => {
  const itemsList = useAppSelector((state) => state.items.items);
  const itemsListLoading = useAppSelector((state) => state.items.loading);
  return (
    <div>
      <Container>
      <Row xs={1} sm={2} md={3} lg={5}>
        {itemsListLoading ? (
          <div className="loaderBox"><div className="loader"></div></div>
        ) : (
          <>
            {Object.keys(itemsList).length ? (
              <>
                {Object.keys(itemsList).map((key) => <Col><Item key={itemsList[key]._id} {...itemsList[key]} /></Col>)}
              </>
            ) : (
              <>No Data Found</>
            )}
          </>
        )}
      </Row>
      </Container>
    </div>
  )
}

export default ItemList;
