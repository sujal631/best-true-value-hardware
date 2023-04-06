//Import necessary modules
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

// Define the initial state of loading for the reducer
const initialState = { loading: false };
// Define the reducer function that updates the loading state
const reducer = (state, action) => {
  const actionHandlers = {
    REQUEST: { ...state, loading: true },
    SUCCESS: { ...state, loading: false },
    FAILURE: { ...state, loading: false },
  };
  return actionHandlers[action.type] || state;
};

// Define a helper function to round a number to two decimal places
const roundToTwoDecimalPlaces = (num) =>
  Math.round(num * 100 + Number.EPSILON) / 100;
export default function PreviewOrderPage() {
  const navigate = useNavigate();
  // Get the global state and dispatch function from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Define a reducer to manage the loading state
  const [{ loading }, dispatch] = useReducer(reducer, initialState);
  // Get the cart and user info from the global state
  const { cart, userInfo } = state;

  // Check if a payment method has been selected, otherwise redirect to payment method selection page
  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/paymentMethod');
    }
  }, [cart.paymentMethod, navigate]);

  // Define a function to place an order
  const handlePlaceOrder = async () => {
    try {
      // Set the loading state to true
      dispatch({ type: 'REQUEST' });
      // Make a request to the backend to place the order
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingInfo: cart.shippingInfo,
          paymentMethod: cart.paymentMethod,
          itemsPrice: itemsPrice,
          taxPrice: taxPrice,
          totalPrice: totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      // Clear the cart, set the loading state to false, remove cart items from local storage, and navigate to the order confirmation page
      ctxDispatch({ type: 'CLEAR' });
      dispatch({ type: 'SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);

      // Set the loading state to false and display an error message
    } catch (error) {
      dispatch({ type: 'FAILURE' });
      toast.error(getErrorMessage(error));
    }
  };
  // Calculate the item price, tax price, and total price
  const itemsPrice = roundToTwoDecimalPlaces(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  const taxPrice = roundToTwoDecimalPlaces(0.105 * itemsPrice);
  const totalPrice = itemsPrice + taxPrice;

  const orderDetails = [
    { label: 'Item(s)', value: itemsPrice },
    { label: 'Tax', value: taxPrice },
    { label: 'Order Total', value: totalPrice.toFixed(2), isTotal: true },
  ];

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4 />
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      {/* Header of the page*/}
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col xs={12} lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title style={{ color: '#dd2222' }}>
                Your Information
              </Card.Title>
              <Card.Text>
                <div>
                  <span>
                    <strong>Name: </strong>
                    {`${cart.shippingInfo.firstName} ${cart.shippingInfo.lastName}`}
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Phone Number: </strong>
                    {cart.shippingInfo.phoneNumber}
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Address: </strong>
                    {`${cart.shippingInfo.address}, ${cart.shippingInfo.city}, ${cart.shippingInfo.region}, ${cart.shippingInfo.zip}`}
                  </span>
                </div>
              </Card.Text>
              <Button
                className="btn btn-outline-success btn-text mb-1"
                style={{ padding: '2px 5px' }}
                variant="light"
                as={Link}
                to="/shippingInfo"
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
                className="btn btn-outline-success btn-text mb-1"
                style={{ padding: '2px 5px' }}
                variant="light"
                as={Link}
                to="/paymentMethod"
              >
                Edit
              </Button>
              <hr />
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                Your Items
              </Card.Title>
              <ListGroup>
                {/*  Mapping over an array of items in the cart to render a ListGroup.Item component for each item */}
                {cart.cartItems.map((item) => {
                  //  Destructuring the item object to extract its properties
                  const { _id, image, name, slug, quantity, price } = item;
                  return (
                    <ListGroup.Item key={_id}>
                      <Row className="align-items-center">
                        <Col xs={12} lg={12} className="my-2">
                          <img
                            src={image}
                            alt={name}
                            className="img-fluid rounded img-thumbnail d-block mb-1"
                            style={{ maxWidth: '80px', maxHeight: '80px' }}
                          />
                          <Link
                            className="remove-link-style"
                            to={`/product/${slug}`}
                          >
                            <strong>{name}</strong>
                          </Link>
                        </Col>
                        <Col xs={12} lg={6} className="mb-1 btn-text">
                          <span>Qty: {quantity}</span>
                        </Col>
                        <Col xs={12} lg={6} className="mb-1 mx-auto btn-text">
                          Price: {price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              <Button
                className="btn btn-outline-success btn-text mt-3"
                style={{ padding: '2px 5px' }}
                variant="light"
                as={Link}
                to="/cart"
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
                {orderDetails.map((detail, index) => (
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col>{detail.label}</Col>
                      <Col>
                        {detail.isTotal ? (
                          <strong>${detail.value}</strong>
                        ) : (
                          `$${detail.value}`
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <div className="d-grid gap-2 my-3">
                    {/* If cartItems has a length greater than 0, the button is enabled and onClick calls the handlePlaceOrder function */}
                    <Button
                      type="button"
                      onClick={handlePlaceOrder}
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
