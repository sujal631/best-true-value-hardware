import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutSteps from '../Components/CheckoutSteps';
import LoadingSpinner from '../Components/LoadingComponent';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case ' SUCCESS':
      return { ...state, loading: false };
    case 'FAILURE':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PreviewOrderPage() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 50 ? round2(0) : round2(15);
  cart.taxPrice = round2(0.105 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrder = async () => {
    try {
      dispatch({ type: 'REQUEST' });
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingInfo: cart.shippingInfo,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CLEAR' });
      dispatch({ type: 'SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (error) {
      dispatch({ type: 'FAILURE' });
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/paymentMethod');
    }
  }, [cart, navigate]);
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      {/* Displaying the page header */}
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping Info</Card.Title>
              <Card.Text>
                <strong>Name: </strong>
                {cart.shippingInfo.firstName} {cart.shippingInfo.lastName}
                <br />
                <strong>Phone Number: </strong>
                {cart.shippingInfo.phoneNumber}
                <br />
                <strong>Address: </strong>
                {cart.shippingInfo.address}, {cart.shippingInfo.city},{' '}
                {cart.shippingInfo.region}, {cart.shippingInfo.zip},{' '}
                {cart.shippingInfo.country}
              </Card.Text>
              <Link to="/shippingInfo">Edit</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method: </strong>
                {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={2}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={2}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid gap-2 mb-3">
                    <Button
                      type="button"
                      onClick={placeOrder}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingSpinner></LoadingSpinner>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
