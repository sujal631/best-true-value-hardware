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

  function calculateSubtotal(items) {
    const subtotal = items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    return `$${subtotal.toFixed(2)}`;
  }

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
            <Message variant="warning">
              Oops, there are no items in your bag. Want to{' '}
              <Button variant="warning" onClick={() => navigate('/')}>
                GO SHOPPING ?
              </Button>{' '}
            </Message>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={12} className="my-3">
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
                    <Col md={4} className="my-3">
                      <Button
                        variant="light"
                        disabled={item.quantity === 1}
                        onClick={() => updateCart(item, item.quantity - 1)}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span style={{ margin: '0 10px' }}>
                        <strong>Qty: {item.quantity}</strong>
                      </span>{' '}
                      <Button
                        variant="light"
                        disabled={item.quantity === item.countInStock}
                        onClick={() => updateCart(item, item.quantity + 1)}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>{' '}
                    </Col>
                    <Col md={4} className="my-3">
                      <strong>Price: {item.price}</strong>
                    </Col>
                    <Col md={4} className="my-3">
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
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h4>
                    Subtotal: <strong>{calculateSubtotal(cartItems)}</strong>
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
