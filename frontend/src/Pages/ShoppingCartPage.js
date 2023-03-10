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
        <Col md={8}>
          {cartItems.length === 0 ? (
            <Message variant="warning">
              Your cart is empty. Want to{' '}
              <Button variant="warning" onClick={() => navigate('/')}>
                GO SHOPPING ?
              </Button>{' '}
            </Message>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={12} className="mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail mx-1 "
                      ></img>{' '}
                      <Link
                        className="remove-link-style"
                        to={`/product/${item.slug}`}
                      >
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Button
                        variant="primary"
                        disabled={item.quantity === 1}
                        onClick={() => updateCart(item, item.quantity - 1)}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span style={{ margin: '0 10px' }}>
                        <strong>{item.quantity}</strong>
                      </span>{' '}
                      <Button
                        variant="primary"
                        disabled={item.quantity === item.countInStock}
                        onClick={() => updateCart(item, item.quantity + 1)}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>{' '}
                    </Col>
                    <Col md={4} className="mb-3">
                      <strong>{item.price}</strong>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Button
                        onClick={() => removeItem(item)}
                        variant="primary"
                      >
                        <i className="fa fa-trash">
                          {' '}
                          <span
                            style={{
                              padding: '0 10px',
                              fontWeight: '300',
                              fontSize: '13px',
                            }}
                          >
                            Delete
                          </span>
                        </i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h4>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) : <br />$
                    {cartItems
                      .reduce((a, c) => a + c.price * c.quantity, 0)
                      .toFixed(2)}
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
                      Checkout
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
