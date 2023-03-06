import axios from 'axios';
import React, { useContext } from 'react';
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';

export default function ShoppingCartPage() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCart = async (item, quantity) => {
    const { data } = await axios.get(`api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, this product is out of stock');
      return;
    }
    ctxDispatch({ type: 'ADD_ITEM', payload: { ...item, quantity } });
  };

  const removeItem = (item) => {
    ctxDispatch({ type: 'REMOVE_ITEM', payload: item });
  };

  const checkOut = () => {
    navigate('/login?redirect=/shippingInfo');
  };
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Shopping Cart</h1>
      <Row>
        <Col md={9}>
          {cartItems.length === 0 ? (
            <Message>
              Your cart is empty. Want to <Link to="/">GO SHOPPING</Link>?
            </Message>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={7}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="light"
                        disabled={item.quantity === 1}
                        onClick={() => updateCart(item, item.quantity - 1)}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        variant="light"
                        disabled={item.quantity === item.countInStock}
                        onClick={() => updateCart(item, item.quantity + 1)}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>{' '}
                    </Col>
                    <Col md={2}>{item.price}</Col>
                    <Col md={1}>
                      <Button onClick={() => removeItem(item)} variant="light">
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h4>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) : $
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h4>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      variant="primary"
                      onClick={checkOut}
                      type="button"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
