// Import necessary modules and dependencies
import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../Components/LoadingComponent.js';
import Message from '../Components/MessageComponent.js';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';

// Reducer function for handling state changes
const reducer = (state, action) => {
  const cases = {
    REQUEST: { ...state, loading: true, error: '' },
    SUCCESS: { ...state, loading: false, order: action.payload, error: '' },
    FAILURE: { ...state, loading: false, error: action.payload },
    PAY_REQUEST: { ...state, loadingPay: true },
    PAY_SUCCESS: { ...state, loadingPay: false, successPay: true },
    PAY_FAIL: { ...state, loadingPay: false },
    PAY_RESET: { ...state, loadingPay: false, successPay: false },
    default: state,
  };
  return cases[action.type] || cases.default;
};

export default function OrderScreen() {
  // Getting user information from context
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Getting the order ID from URL parameters and navigation function from react-router-dom
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  // Defining state variables and reducer for handling state changes
  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: '',
      successPay: false,
      loadingPay: false,
    });

  // Extracting the 'isPending' state variable and 'paypalDispatch' function from the usePayPalScriptReducer hook
  const paypalScriptReducer = usePayPalScriptReducer();
  const isPending = paypalScriptReducer[0].isPending;
  const paypalDispatch = paypalScriptReducer[1];

  // Function for handling PayPal order creation
  const createPayPalOrder = (data, actions) => {
    const { totalPrice } = order;
    const formattedPrice = totalPrice.toFixed(2);
    const purchaseUnits = [{ amount: { value: formattedPrice } }];
    const orderData = { purchase_units: purchaseUnits };
    return actions.order.create(orderData).then((orderId) => orderId);
  };

  // Function for handling the approval of the PayPal payment
  const handleApprove = async (data, actions) => {
    try {
      // Dispatch a payment request action to update the payment status
      dispatch({ type: 'PAY_REQUEST' });
      // Capture the payment details from the PayPal API
      const captureDetails = await actions.order.capture();
      // Send a PUT request to the server to update the order's payment status
      const { data: payData } = await axios.put(
        `/api/orders/${order._id}/pay`,
        captureDetails,
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      // Dispatch a payment success action and display a success message
      dispatch({ type: 'PAY_SUCCESS', payload: payData });
      toast.success('Payment Successful!');
      // Dispatch a payment failure action and display an error message
    } catch (getErrorMessage) {
      const errorMessage = getErrorMessage(error);
      dispatch({ type: 'PAY_FAIL', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Function for handling errors during the PayPal payment process
  const handleError = (err) => {
    const errorMessage = getErrorMessage(err);
    toast.error(errorMessage);
  };

  // Define a useEffect hook to fetch the order data and configure the PayPal SDK
  useEffect(() => {
    // Check if the order ID is valid and needs to be fetched
    const isOrderValid = order._id && order._id === orderId;
    const shouldFetchOrder = !isOrderValid || successPay;

    // Define a helper function to fetch the PayPal client ID from the server
    const fetchPaypalClientId = async (token) => {
      const response = await axios.get('/api/keys/paypal', {
        headers: { authorization: `Bearer ${token}` },
      });
      return response.data.clientId;
    };

    // Define a helper function to configure the PayPal SDK with the client ID
    const configurePaypal = async (dispatch, token, paypalDispatch) => {
      const clientId = await fetchPaypalClientId(token);
      dispatch({
        type: 'resetOptions',
        value: {
          'client-id': clientId,
          currency: 'USD',
        },
      });
      paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
    };

    // Define a helper function to load the PayPal SDK script
    const loadPaypalScript = async () => {
      await configurePaypal(dispatch, userInfo.token, paypalDispatch);
    };

    // If userInfo is not defined, navigate to the login page and return
    if (!userInfo) {
      navigate('/login');
      return;
    }

    // If the order should be fetched, fetch the order from the server
    if (shouldFetchOrder) {
      async function fetchOrder() {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        try {
          // Make a GET request to the server to fetch the order details
          const response = await axios.get(`/api/orders/${orderId}`, config);

          // Dispatch the SUCCESS action with the order details as the payload
          dispatch({ type: 'SUCCESS', payload: response.data });

          // Dispatch the FAILURE action with the error message as the payload
        } catch (error) {
          dispatch({ type: 'FAILURE', payload: getErrorMessage(error) });
        }
      }

      fetchOrder();
      // If a payment has just been made, reset the payment state
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      // Otherwise, load the PayPal script
    } else {
      loadPaypalScript();
    }
  }, [
    dispatch,
    navigate,
    orderId,
    order,
    paypalDispatch,
    successPay,
    userInfo,
  ]);

  return loading ? (
    <LoadingSpinner></LoadingSpinner>
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col xs={12} lg={8}>
          <Card className="mb-3">
            {/*Display the customer information */}
            <Card.Body>
              <Card.Title style={{ color: '#dd2222' }}>
                Your Information
              </Card.Title>
              <Card.Text>
                <div>
                  <span>
                    <strong>Name: </strong>
                    {`${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`}
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Phone Number: </strong>
                    {order.shippingInfo.phoneNumber}
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Address: </strong>
                    {`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.region}, ${order.shippingInfo.zip}`}
                  </span>
                </div>
              </Card.Text>

              {/* Message component displays a message based on whether the order is available for pickup or not */}
              {order.isPickupReady ? (
                <Message variant="success" className="mb-3">
                  Your order is now <strong>AVAILABLE FOR STORE PICKUP</strong>{' '}
                  Kindly come to the store and present a valid photo ID to
                  collect your items. Thank you.
                </Message>
              ) : (
                <Message variant="danger" className="mb-3">
                  Your item is{' '}
                  <strong>NOT CURRENTLY AVAILABLE FOR STORE PICKUP</strong>. A
                  representative from the store will contact you at the phone
                  number provided as soon as the item(s) become available for
                  collection.
                </Message>
              )}
              <hr></hr>

              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                {/*Display the payment details */}
                Your Payment
              </Card.Title>
              <Card.Text>
                <strong>Selected Method: </strong>
                {order.paymentMethod}
              </Card.Text>
              {/* Message component displays a message based on whether the order has been paid for or not */}
              {order.isPaid ? (
                <Message variant="success" className="mb-3">
                  Thank you for your payment. Please note that your order will
                  be ready for pickup at the store. A representative from the
                  store will contact you at the phone number you provided to
                  arrange for <strong>STORE PICKUP</strong> process. We
                  appreciate your business and thank you for shopping with us.
                </Message>
              ) : (
                <Message variant="danger" className="mb-3">
                  Your order has not been paid for. Please proceed to make
                  payment for your item(s). Once payment has been received, a
                  representative from the store will contact you at the phone
                  number provided to arrange for <strong>STORE PICKUP</strong>{' '}
                  process.
                </Message>
              )}
              <hr></hr>
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                {/* Displays the items in the order including the item's image, name, quantity, and price */}
                Your Items
              </Card.Title>
              <ListGroup>
                {order.orderItems.map((item) => {
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
                        <Col xs={12} lg={6} className="mb-1  btn-text">
                          <span>Qty: {quantity}</span>
                        </Col>
                        <Col xs={12} lg={6} className="mb-1 mx-auto btn-text">
                          Price: ${price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card>
            <Card.Body>
              {/* Order summary component displaying subtotal, tax, and total prices for the order*/}
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Item(s)</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {/* If the order has not been paid for, the PayPal buttons are displayed and the 'createOrder', 'onApprove', and 'onError' methods are called when appropriate */}
                    {isPending ? (
                      <LoadingSpinner />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createPayPalOrder}
                          onApprove={handleApprove}
                          onError={handleError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <LoadingSpinner></LoadingSpinner>}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
