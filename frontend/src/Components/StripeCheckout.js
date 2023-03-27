import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from '@stripe/react-stripe-js';
import { Button, Card } from 'react-bootstrap';
import Axios from 'axios';

function CheckoutForm(props) {
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);
    const { data } = await Axios(`/api/stripe/secret/${props.orderId}`);
    const clientSecret = data.client_secret;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: data.order.user.name,
          email: data.order.user.email,
        },
      },
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
      alert(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        props.handleSuccessPayment(result.paymentIntent, data.order); // Pass the order object as an additional argument
        console.log(result.paymentIntent);
        // alert(result.paymentIntent.status);
      }
    }
    setProcessing(false);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Payment Info</Card.Title>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="card-element" style={{ marginBottom: '0.5rem' }}>
              Credit or Debit card
            </label>
            <CardElement id="card-element" className="card-element" />
            <div id="card-errors" role="alert" />
          </div>

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

const StripeCheckout = (props) => (
  <Elements stripe={props.stripe}>
    <CheckoutForm
      orderId={props.orderId}
      handleSuccessPayment={props.handleSuccessPayment}
    />
  </Elements>
);
export default StripeCheckout;
