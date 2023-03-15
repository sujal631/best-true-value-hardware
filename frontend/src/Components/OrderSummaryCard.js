// Import the necessary components
import React from 'react';
import { Card, ListGroup, Row, Col } from 'react-bootstrap';
import { PayPalButtons } from '@paypal/react-paypal-js';
import LoadingSpinner from '../Components/LoadingComponent.js';

// Define the OrderSummaryCard functional component, which takes several props including order details and PayPal-related functions
const OrderSummaryCard = ({
  order,
  createPayPalOrder,
  handleApprove,
  handleError,
  isPending,
  loadingPay,
}) => {
  // Define an array of objects containing labels and values for displaying order details
  const orderDetails = [
    { label: 'Item(s)', value: order.itemsPrice.toFixed(2) },
    { label: 'Tax', value: order.taxPrice.toFixed(2) },
    { label: 'Order Total', value: order.totalPrice.toFixed(2), isTotal: true },
  ];

  return (
    <Card>
      <Card.Body>
        <Card.Title>Order Summary</Card.Title>
        <ListGroup variant="flush">
          {/* Map over the orderDetails array and create a ListGroup.Item for each detail */}
          {orderDetails.map((detail, index) => (
            <ListGroup.Item key={index}>
              <Row>
                <Col>{detail.label}</Col>
                <Col>
                  {/* Display the value as a strong text if it is the order total, otherwise display it as a regular text */}
                  {detail.isTotal ? (
                    <strong>${detail.value}</strong>
                  ) : (
                    `$${detail.value}`
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
          {/* If the order is not paid, display the PayPal buttons and loading indicators as necessary */}
          {!order.isPaid && (
            <ListGroup.Item>
              {isPending ? (
                <LoadingSpinner />
              ) : (
                <div>
                  {/* Render the PayPalButtons component with the provided createOrder, onApprove, and onError functions */}
                  <PayPalButtons
                    createOrder={createPayPalOrder}
                    onApprove={handleApprove}
                    onError={handleError}
                  ></PayPalButtons>
                </div>
              )}
              {/* Display a loading spinner if loadingPay is true */}
              {loadingPay && <LoadingSpinner />}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

// Export the OrderSummaryCard component as the default export
export default OrderSummaryCard;
