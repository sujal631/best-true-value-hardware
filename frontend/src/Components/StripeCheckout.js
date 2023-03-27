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

function CheckoutForm(props) {
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
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
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: cardholderName,
          email: data.order.user.email,
        },
      },
    });

    if (result.error) {
      console.log(result.error.message);
      alert(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        props.handleSuccessPayment(result.paymentIntent, data.order);
        console.log(result.paymentIntent);
      }
    }
    setProcessing(false);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Payment Info</Card.Title>
        <form onSubmit={handleSubmit} className="checkout-form">
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
