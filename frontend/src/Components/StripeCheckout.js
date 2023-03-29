// Import necessary modules
import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
} from '@stripe/react-stripe-js';
import { Button, Card } from 'react-bootstrap';
import Axios from 'axios';

// CheckoutForm component to handle Stripe payment form
function CheckoutForm(props) {
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  // Handle form submission to process the payment
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);

    // Fetch the client secret from the server for the specific order
    const { data } = await Axios(`/api/stripe/secret/${props.orderId}`);
    const clientSecret = data.client_secret;

    // Confirm card payment with Stripe using the client secret
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: cardholderName,
          email: data.order.user.email,
        },
      },
    });

    // Handle errors if the payment fails
    if (result.error) {
      console.log(result.error.message);
      alert(result.error.message);
    } else {
      // Process the successful payment
      if (result.paymentIntent.status === 'succeeded') {
        props.handleSuccessPayment(result.paymentIntent, data.order);
        console.log(result.paymentIntent);
      }
    }
    setProcessing(false);
  };

  // Render the payment form
  return (
    <Card>
      <Card.Body>
        <Card.Title>Payment Info</Card.Title>
        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Form fields for cardholder's name, card number, expiration date, and CVC */}
          <div className="form-row">
            <label htmlFor="cardholder-name" style={{ marginBottom: '0.5rem' }}>
              Name on card
            </label>
            <input
              type="text"
              id="cardholder-name"
              className="form-control card-element"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label
              htmlFor="card-number-element"
              style={{ marginBottom: '0.5rem' }}
            >
              Card number
            </label>
            <CardNumberElement
              id="card-number-element"
              className="card-element"
            />
          </div>

          <div className="form-row">
            <label htmlFor="card-expiry-element">Expiration date</label>
            <CardExpiryElement
              id="card-expiry-element"
              className="card-element"
            />
          </div>

          <div className="form-row">
            <label htmlFor="card-cvc-element">CVC</label>
            <CardCvcElement id="card-cvc-element" className="card-element" />
          </div>

          <div id="card-errors" role="alert" />

          {/* Submit button */}
          <div className="d-grid">
            <Button
              type="submit"
              className="btn-block mt-3"
              disabled={!stripe || processing}
            >
              {processing ? 'Processing…' : 'Submit Payment'}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}

// StripeCheckout component to wrap the CheckoutForm with Stripe Elements
const StripeCheckout = (props) => (
  <Elements stripe={props.stripe}>
    <CheckoutForm
      orderId={props.orderId}
      handleSuccessPayment={props.handleSuccessPayment}
    />
  </Elements>
);

export default StripeCheckout;
