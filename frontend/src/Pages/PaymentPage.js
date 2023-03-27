// Importing necessary dependencies and components
import React, { useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../Components/CheckoutSteps';
import { Store } from '../Store';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Defining the PaymentPage component
export default function PaymentPage() {
  // Creating a navigate constant using useNavigate from react-router-dom
  const navigate = useNavigate();
  // Destructuring the state and dispatch from the Store context
  const { state, dispatch } = useContext(Store);

  // Initializing the paymentMethodName state with the current payment method or 'Debit/Credit Card'
  const [paymentMethodName, setPaymentMethod] = useState(
    state.cart.paymentMethod || 'Debit/Credit'
  );

  // Function to handle the radio button change
  const handleRadioChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  //Function to update the payment method in the global state
  const dispatchPaymentMethod = (dispatch, paymentMethodName) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: paymentMethodName });
  };

  // Setting up a handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch an action to update the payment method in the global state
    dispatchPaymentMethod(dispatch, paymentMethodName);
    // Store the payment method in local storage
    localStorage.setItem('paymentMethod', paymentMethodName);
    // Navigate to the previewOrder page
    navigate('/previewOrder');
  };

  // Rendering the PaymentPage component
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Payment Method</title>
      </Helmet>
      {/* Rendering the CheckoutSteps component */}
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        {/* Displaying the page header */}
        <h1 className="my-3">Your Payment</h1>
        {/* Rendering a Form component to select a payment method */}
        <Form onSubmit={handleSubmit}>
          {/* Rendering radio buttons to select the payment method */}
          {['Debit/Credit', 'PayPal'].map((method) => (
            <div className="mb-3" key={method}>
              <Form.Check
                type="radio"
                id={method}
                label={
                  <div>
                    {method === 'Debit/Credit' && (
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        style={{ marginRight: '10px', fontSize: '22px' }}
                      />
                    )}
                    {method === 'PayPal' && (
                      <FontAwesomeIcon
                        icon={faPaypal}
                        style={{ marginRight: '18px', fontSize: '22px' }}
                      />
                    )}
                    {method}
                  </div>
                }
                value={method}
                checked={paymentMethodName === method}
                onChange={handleRadioChange}
                className="radio-button"
              ></Form.Check>
            </div>
          ))}
          {/* Rendering a button to continue to the previewOrder page */}
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
