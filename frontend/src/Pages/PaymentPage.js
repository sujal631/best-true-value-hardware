// Importing necessary dependencies and components
import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../Components/CheckoutSteps';
import { Store } from '../Store';

// Defining the PaymentPage component
export default function PaymentPage() {
  // Creating a navigate constant using useNavigate from react-router-dom
  const navigate = useNavigate();
  // Destructuring the state and dispatch from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Initializing the paymentMethodName state with the current payment method or 'PayPal'
  const [paymentMethodName, setPaymentMethod] = useState(
    state.cart.paymentMethod || 'PayPal'
  );

  // Setting up an effect to navigate to the shippingInfo page if no shipping info address is available
  useEffect(() => {
    if (!state.cart.shippingInfo.address) {
      navigate('/shippingInfo');
    }
  }, [state.cart.shippingInfo.address, navigate]);

  // Setting up a submitHandler function to dispatch the selected payment method to the Store and local storage, then navigate to the previewOrder page
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/previewOrder');
  };

  // Rendering the PaymentPage component
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Payment Methods</title>
      </Helmet>
      {/* Rendering the CheckoutSteps component */}
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        {/* Displaying the page header */}
        <h1 className="my-3">Payment Methods</h1>
        {/* Rendering a Form component to select a payment method */}
        <Form onSubmit={submitHandler}>
          {/* Rendering radio buttons to select the payment method */}
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
          {/* Rendering a button to continue to the previewOrder page */}
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
