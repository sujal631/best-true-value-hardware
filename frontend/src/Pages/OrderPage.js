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

function reducer(state, action) {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true, error: '' };
    case 'SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [{ loading, error, order, successPay, loadingPay }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: '',
      successPay: false,
      loadingPay: false,
    });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice.toFixed(2) },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success(
          'Your payment has been successfully processed, and your order has been placed.'
        );
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getErrorMessage(err) });
        toast.error(getErrorMessage(err));
      }
    });
  }
  function onError(err) {
    toast.error(getErrorMessage(err));
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FAILURE', payload: getErrorMessage(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
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
  }, [order, userInfo, orderId, navigate, paypalDispatch, successPay]);
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
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Your Information</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {order.shippingInfo.firstName}{' '}
                {order.shippingInfo.lastName} <br />
                <strong>Phone Number:</strong> {order.shippingInfo.phoneNumber}{' '}
                <br />
                <strong>Address: </strong> {order.shippingInfo.address},{' '}
                {order.shippingInfo.city}, {order.shippingInfo.region},{' '}
                {order.shippingInfo.zip} {/*{order.shippingInfo.country}*/}
              </Card.Text>
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
              <Card.Title className="mt-3">Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>
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
              <Card.Title className="mt-3">Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={12} className="mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail d-block mb-1"
                          style={{ maxWidth: '80px', maxHeight: '80px' }}
                        ></img>{' '}
                        <Link
                          className="remove-link-style"
                          to={`/product/${item.slug}`}
                        >
                          <strong>{item.name}</strong>
                        </Link>
                      </Col>
                      <Col md={6} className="mb-1 btn-text">
                        Qty: {item.quantity}
                      </Col>
                      <Col md={6} className="mb-1 text-end btn-text">
                        Price: ${item.price}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
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
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingSpinner />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
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
