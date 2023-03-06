import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../Components/CheckoutSteps';
import { Store } from '../Store';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingInfo, paymentMethod },
  } = state;
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal'
  );
  useEffect(() => {
    if (!shippingInfo.address) {
      navigate('/shippingInfo');
    }
  }, [shippingInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/previewOrder');
  };
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Payment Methods</title>
      </Helmet>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        {/* Displaying the page header */}
        <h1 className="my-3">Payment Methods</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="PayPal"
              label="PayPal"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </div>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="Stripe"
              checked={paymentMethodName === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </div>
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
