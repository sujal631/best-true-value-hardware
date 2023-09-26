// Import necessary modules and dependencies
import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
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
import OrderSummaryCard from '../Components/OrderSummaryCard';
import { Button } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js/pure';
import StripeCheckout from '../Components/StripeCheckout';
import ReactModal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

// Define the default state of the reducer
const initialState = {
  loading: true,
  loadingPay: false,
  loadingPickupReady: false,
  successPay: false,
  successPickupReady: false,
  order: {},
  error: '',
};

// Map the action types to specific functions to update the state
const actionsMap = {
  REQUEST: (state) => ({ ...state, loading: true, error: '' }),
  SUCCESS: (state, action) => ({
    ...state,
    loading: false,
    order: action.payload,
    error: '',
  }),
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
  PAY_REQUEST: (state) => ({ ...state, loadingPay: true }),
  PAY_SUCCESS: (state) => ({ ...state, loadingPay: false, successPay: true }),
  PAY_FAILURE: (state) => ({ ...state, loadingPay: false }),
  PAY_RESET: (state) => ({ ...state, loadingPay: false, successPay: false }),
  PICKUP_REQUEST: (state) => ({ ...state, loadingPickupReady: true }),
  PICKUP_SUCCESS: (state) => ({
    ...state,
    loadingPickupReady: false,
    successPickupReady: true,
  }),
  PICKUP_FAILURE: (state) => ({
    ...state,
    loadingPickupReady: false,
  }),
  PICKUP_RESET: (state) => ({
    ...state,
    loadingPickupReady: false,
    successPickupReady: false,
  }),
};

// Reducer function for handling state updates based on dispatched actions
const reducer = (state = initialState, action) => {
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

export default function OrderScreen() {
  // Getting user information from context
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Getting the order ID from URL parameters and navigation function from react-router-dom
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  // Defining state variables and reducer for handling state changes
  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingPickupReady,
      successPickupReady,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  // Get the PayPal Script reducer state and dispatch function
  const paypalScriptReducer = usePayPalScriptReducer();
  // Get the isPending value from the PayPal Script reducer state
  const isPending = paypalScriptReducer[0].isPending;
  // Get the PayPal Script dispatch function
  const paypalDispatch = paypalScriptReducer[1];
  // Declare state for controlling the visibility of the modal
  const [showModal, setShowModal] = useState(false);
  // Declare state for holding the Stripe instance
  const [stripe, setStripe] = useState(null);

  // Function for handling PayPal order creation
  const createPayPalOrder = (data, actions) => {
    const { totalPrice } = order;
    const formattedPrice = totalPrice.toFixed(2);
    const purchaseUnits = [{ amount: { value: formattedPrice } }];
    const orderData = { purchase_units: purchaseUnits };
    return actions.order.create(orderData).then((orderId) => orderId);
  };

  //Create the invoice for the user
  const handleInvoice = async () => {
    //Give user invoice
    const itemsInfo = order.orderItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x ${item.quantity} @ $${item.price}`
      )
      .join('\n');
    const detailedMessage = `
      From: BEST TRUE VALUE HARDWARE
      
      Dear ${order.shippingInfo.firstName} ${order.shippingInfo.lastName},
      
      Thank you for shopping with us. We're pleased to confirm that your payment for order ID #${
        order._id
      } has been successfully processed.
      
      Order Details:
      ${itemsInfo}
      
      Total Amount: $${order.totalPrice.toFixed(2)}
      
      Your trust in our services is greatly appreciated. We hope to see you again soon.
      
      Best wishes,
      BEST TRUE VALUE HARDWARE Team
      `;

    try {
      // Send the SMS message using the Twilio API
      const response = await axios.post('/api/twilio/sendSms', {
        to: order.shippingInfo.phoneNumber,
        message: detailedMessage,
      });

      // If the SMS sending is successful, update the order status and close the modal
      if (response.data.success) {
        setShowModal(false);
        window.scrollTo(0, 0);
      } else {
        toast.error(`Error sending SMS: ${response.data.error}`);
      }
    } catch (error) {
      toast.error(`Error sending SMS: ${error.message}`);
    }
  };

  const handleEmailInvoice = async () => {
    //Give user invoice
    const itemsInfo = order.orderItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x ${item.quantity} @ $${item.price}`
      )
      .join('\n');
    const detailedMessage = `
      From: BEST TRUE VALUE HARDWARE
      
      Dear ${order.shippingInfo.firstName} ${order.shippingInfo.lastName},
      
      Thank you for shopping with us. We're pleased to confirm that your payment for order ID #${
        order._id
      } has been successfully processed.
      
      Order Details:
      ${itemsInfo}
      
      Total Amount: $${order.totalPrice.toFixed(2)}
      
      Your trust in our services is greatly appreciated. We hope to see you again soon.
      
      Best wishes,
      BEST TRUE VALUE HARDWARE Team
      `;

    try {
      // Send the Email message using the SendGrid API
      const response = await axios.post('/api/sendgrid/sendEmail', {
        to: order.shippingInfo.email,
        subject: 'Your Payment Confirmation and Invoice',
        text: detailedMessage,
      });

      // If the Email sending is successful, update the order status and close the modal
      if (response.data.success) {
        setShowModal(false);
        window.scrollTo(0, 0);
      } else {
        toast.error(`Error sending Email: ${response.data.error}`);
      }
    } catch (error) {
      toast.error(`Error sending Email: ${error.message}`);
    }
  };

  // Function to handle successful payments
  const handleSuccessPayment = async (paymentIntent, orderObj) => {
    try {
      // If the order object is not found, throw an error
      if (!orderObj) {
        throw new Error('Order not found');
      }
      dispatch({ type: 'PAY_REQUEST' });
      // Send the payment intent to the server for processing
      const { data } = await axios.put(
        `/api/stripe/${orderObj._id}/secret`,
        paymentIntent,
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'PAY_SUCCESS', payload: data });
      // Show a success message
      toast.success('Payment Successful!');
      //Give invoice to the user
      handleInvoice();
      handleEmailInvoice();
    } catch (err) {
      dispatch({ type: 'PAY_FAILURE', payload: getErrorMessage(err) });
      toast.error(getErrorMessage(err));
    }
  };

  // Function to handle the approval of the PayPal payment
  const handleApprove = async (data, actions) => {
    try {
      dispatch({ type: 'PAY_REQUEST' });
      // Capture the payment details from PayPal
      const captureDetails = await actions.order.capture();
      // Send the captured payment details to the server for processing
      const { data: payData } = await axios.put(
        `/api/orders/${order._id}/pay`,
        captureDetails,
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'PAY_SUCCESS', payload: payData });
      // Show a success message
      toast.success('Payment Successful!');
      //Give invoice to the user
      handleInvoice();
      handleEmailInvoice();
    } catch (getErrorMessage) {
      const errorMessage = getErrorMessage(error);
      dispatch({ type: 'PAY_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Function to handle errors during the PayPal payment process
  const handleError = (err) => {
    const errorMessage = getErrorMessage(err);
    toast.error(errorMessage);
  };

  // Function to handle clicking the "Pickup Ready" button
  function handleClickPickupReady() {
    setShowModal(true);
  }

  // Asynchronous function to handle setting the order status to "pickup ready"
  async function handlePickupReady() {
    try {
      dispatch({ type: 'PICKUP_REQUEST' });
      // Send a request to the server to update the order status
      const { data } = await axios.put(
        `/api/orders/${order._id}/pickupReady`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'PICKUP_SUCCESS', payload: data });
      setShowModal(false);
      // Show a success message informing the user that the order is ready for pickup
      toast.success(
        'The order is now available for pickup, and a confirmation notice has been sent to the customer.'
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch({ type: 'PICKUP_FAILURE' });
    }
  }

  // Asynchronous function to send an SMS notification and show a confirmation popup for the pickup-ready feature
  const onConfirm = async (event) => {
    event.preventDefault();

    // First, update the order status to "pickup ready"
    await handlePickupReady();

    // Prepare the detailed message to be sent via SMS and Email
    const itemsInfo = order.orderItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x ${item.quantity} @ $${item.price}`
      )
      .join('\n');
    const detailedMessage = `
      From: BEST TRUE VALUE HARDWARE
      
      Dear ${order.shippingInfo.firstName} ${order.shippingInfo.lastName},
      
      Good news! Your order (Order ID: #${order._id}) is now ready for pickup.
      
      Order Details:
      ${itemsInfo}
      
      Total Amount: $${order.totalPrice.toFixed(2)}
      
      We appreciate your business and look forward to serving you again soon.
      
      Warm regards,
      BEST TRUE VALUE HARDWARE Team
      `;

    //send SMS
    try {
      // Send the SMS message using the Twilio API
      const response = await axios.post('/api/twilio/sendSms', {
        to: order.shippingInfo.phoneNumber,
        message: detailedMessage,
      });

      // If the SMS sending is successful, update the order status and close the modal
      //   if (response.data.success) {
      //     handlePickupReady();
      //     setShowModal(false);
      //     window.scrollTo(0, 0);
      //   } else {
      //     toast.error(`Error sending SMS: ${response.data.error}`);
      //   }
      // } catch (error) {
      //   toast.error(`Error sending SMS: ${error.message}`);
      // }

      if (!response.data.success) {
        throw new Error(response.data.error);
      }
    } catch (error) {
      toast.error(`Error sending SMS: ${error.message}`);
    }

    // Send Email
    try {
      const emailResponse = await axios.post('/api/sendgrid/sendEmail', {
        to: order.shippingInfo.email,
        subject: 'Pickup',
        text: detailedMessage,
      });

      if (!emailResponse.data.success) {
        throw new Error(emailResponse.data.error);
      }
    } catch (error) {
      toast.error(`Error sending Email: ${error.message}`);
    }
  };

  // Define a useEffect hook to fetch the order data
  useEffect(() => {
    // Asynchronous function to add the Stripe script to the page
    const addStripeScript = async () => {
      try {
        // Get the Stripe client ID from the server
        const { data: clientId } = await axios.get('/api/stripe/key');
        // Load the Stripe script with the client ID
        const stripeObj = await loadStripe(clientId);
        // Set the Stripe object in the component state
        setStripe(stripeObj);
      } catch (error) {}
    };

    // If the payment method is Debit/Credit and the Stripe object is not loaded, add the Stripe script
    if (order.paymentMethod === 'Debit/Credit') {
      if (!stripe) {
        addStripeScript();
      }
    }

    // Asynchronous function to fetch the order details
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'REQUEST' });
        // Send a GET request to fetch the order data
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FAILURE', payload: getErrorMessage(err) });
      }
    };

    // If the user is not logged in, navigate to the login page
    if (!userInfo) {
      return navigate('/login');
    }
    // Check if the order needs to be fetched or the payment state needs to be reset
    if (
      !order._id ||
      successPay ||
      successPickupReady ||
      (order._id && order._id !== orderId)
    ) {
      // Fetch the order data
      fetchOrder();

      // If the payment was successful, reset the payment state
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }

      // If the pickup was successful, reset the pickup state
      if (successPickupReady) {
        dispatch({ type: 'PICKUP_RESET' });
      }
    } else {
      // Asynchronous function to load the PayPal script
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        // Reset the PayPal script options with the new client ID and currency
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
    // Dependencies for the useEffect hook
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    stripe,
    successPickupReady,
  ]);

  // Define the custom styles for the modal
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '220px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
  };

  // Define a useEffect hook to scroll the window to the top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check the loading state to display the appropriate content
  return loading ? (
    // Display a loading spinner if the component is still loading
    <LoadingSpinner></LoadingSpinner>
  ) : error ? (
    // Display an error message if there is an error
    <Message variant="danger">{error}</Message>
  ) : (
    // Display the order details if the component has finished loading and there is no error
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
                {/* Display the customer's name, phone number, and address */}
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
                    <strong>Email: </strong>
                    {order.shippingInfo.email}
                  </span>
                </div>
                <div>
                  <span>
                    <strong>Address: </strong>
                    {`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.region}, ${order.shippingInfo.zip}`}
                  </span>
                </div>
              </Card.Text>

              {/* Display a message based on whether the order is available for pickup or not */}
              {order.isPickupReady ? (
                <Message variant="success" className="mb-3">
                  Your order is now <strong>READY FOR STORE PICKUP.</strong>{' '}
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

              {/* Display the payment details */}
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
                Your Payment
              </Card.Title>
              <Card.Text>
                <strong>Selected Method: </strong>
                {order.paymentMethod}
              </Card.Text>

              {/* Display a message based on whether the order has been paid for or not */}
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

              {/* Display the items in the order including the item's image, name, quantity, and price */}
              <Card.Title className="my-1" style={{ color: '#dd2222' }}>
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

        {/* Display order summary, payment options, and pickup ready button */}
        <Col xs={12} lg={4}>
          {/* Display the order summary card */}
          <OrderSummaryCard order={order} />

          {/* Check if the order has not been paid */}
          {!order.isPaid && (
            <ListGroup.Item>
              {/* Display a loading spinner if the payment is pending */}
              {isPending ? (
                <LoadingSpinner />
              ) : (
                <div>
                  {/* Display PayPal payment option if the selected payment method is PayPal */}
                  {order.paymentMethod === 'PayPal' && (
                    <>
                      <div className="alert alert-info mb-4">
                        <h5>
                          <FontAwesomeIcon icon={faPaypal} className="me-2" />
                          PayPal Sandbox Credentials:
                        </h5>
                        <p style={{ paddingLeft: '10px', paddingTop: '10px' }}>
                          <strong>Email:</strong>{' '}
                          sb-zbry814203473@personal.example.com
                          <br />
                          <strong>Password:</strong> test@123
                        </p>
                      </div>
                      <PayPalButtons
                        createOrder={createPayPalOrder}
                        onApprove={handleApprove}
                        onError={handleError}
                      ></PayPalButtons>
                    </>
                  )}

                  {/* Display a loading spinner if the selected payment method is Debit/Credit and Stripe has not loaded yet */}
                  {!order.isPaid &&
                    order.paymentMethod === 'Debit/Credit' &&
                    !stripe && <LoadingSpinner />}

                  {/* Display Stripe payment option if the selected payment method is Debit/Credit and Stripe has loaded */}
                  {!order.isPaid &&
                    order.paymentMethod === 'Debit/Credit' &&
                    stripe && (
                      <>
                        <div className="alert alert-info mb-4">
                          <h5>
                            <FontAwesomeIcon
                              icon={faCreditCard}
                              className="me-2"
                            />
                            Test Debit/Credit Card:
                          </h5>
                          <p
                            style={{ paddingLeft: '10px', paddingTop: '10px' }}
                          >
                            <strong>Card Number:</strong> 4242 4242 4242 4242
                            <br />
                            <strong>Expiry Date:</strong> Any future date
                            <br />
                            <strong>CVV:</strong> Any 3 digits
                          </p>
                        </div>
                        <StripeCheckout
                          stripe={stripe}
                          orderId={order._id}
                          handleSuccessPayment={handleSuccessPayment}
                        />
                      </>
                    )}
                </div>
              )}
              {/* Display a loading spinner if loadingPay is true */}
              {loadingPay && <LoadingSpinner></LoadingSpinner>}
            </ListGroup.Item>
          )}

          {/* Render the modal for confirming the order is ready for pickup */}
          <ReactModal
            isOpen={showModal}
            onRequestClose={() => setShowModal(false)}
            style={customStyles}
            shouldFocusAfterRender={false}
            shouldReturnFocusAfterClose={false}
          >
            <strong>
              <p>Confirm "READY FOR PICKUP"</p>
            </strong>
            <p>
              Are you sure you want to mark this order as "READY FOR PICKUP"?
            </p>
            <div className="d-flex justify-content-around mt-3">
              <Button
                className="my-2"
                type="button"
                variant="warning"
                onClick={onConfirm}
              >
                CONFIRM
              </Button>
              <Button
                className="my-2"
                type="button"
                variant="primary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </ReactModal>

          {/* Check if the user is an admin, the order is paid, and the order is not marked as ready for pickup */}
          {userInfo.isAdmin && order.isPaid && !order.isPickupReady && (
            <ListGroup.Item>
              {loadingPickupReady && <LoadingSpinner />}

              {/* Button to mark the order as ready for pickup */}
              <div className="d-grid">
                <Button
                  className="my-3"
                  type="button"
                  variant="primary"
                  onClick={handleClickPickupReady}
                >
                  PiCKUP IS READY
                </Button>
              </div>
            </ListGroup.Item>
          )}
        </Col>
      </Row>
    </div>
  );
}
