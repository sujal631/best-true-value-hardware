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
  const actionHandlers = {
    REQUEST: { ...state, loading: true },
    SUCCESS: { ...state, loading: false },
    FAILURE: { ...state, loading: false },
  };

  return actionHandlers[action.type] || state;
};

export default function PreviewOrderPage() {
  const navigate = useNavigate();
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const roundToTwoDecimalPlaces = (num) =>
    Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = roundToTwoDecimalPlaces(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.taxPrice = roundToTwoDecimalPlaces(0.105 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.taxPrice;

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
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <CheckoutSteps step1 step2 step3 step4 />
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col xs={12} lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title style={{ color: '#dd2222' }}>
                Your Information
              </Card.Title>
              <Card.Text>
                <strong>Name: </strong>
                {cart.shippingInfo.firstName} {cart.shippingInfo.lastName}
                <br />
                <strong>Phone Number: </strong>
                {cart.shippingInfo.phoneNumber}
                <br />
                <strong>Address: </strong>
                {cart.shippingInfo.address}, {cart.shippingInfo.city},{' '}
                {cart.shippingInfo.region}, {cart.shippingInfo.zip}
              </Card.Text>
              <Button
                className="mb-1"
                variant="secondary"
                onClick={() => navigate('/shippingInfo')}
              >
                Edit
              </Button>
              <hr />
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                Your Payment
              </Card.Title>
              <Card.Text>
                <strong>Selected Method: </strong>
                {cart.paymentMethod}
              </Card.Text>
              <Button
                className="mb-1"
                variant="secondary"
                onClick={() => navigate('/paymentMethod')}
              >
                Edit
              </Button>
              <hr />
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                Your Items
              </Card.Title>
              <ListGroup>
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center ">
                      <Col xs={12} lg={12} className="my-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail d-block mb-1"
                          style={{ maxWidth: '80px', maxHeight: '80px' }}
                        />
                        <Link
                          className="remove-link-style"
                          to={`/product/${item.slug}`}
                        >
                          <strong>{item.name}</strong>
                        </Link>
                      </Col>
                      <Col xs={12} lg={6} className="mb-1  btn-text">
                        <span>Qty: {item.quantity}</span>
                      </Col>
                      <Col xs={12} lg={6} className="mb-1 mx-auto btn-text">
                        Price: {item.price}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => navigate('/cart')}
              >
                Edit
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Item(s)</Col>
                    <Col>${cart.itemsPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice}</Col>
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
                  {loading && <LoadingSpinner />}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
