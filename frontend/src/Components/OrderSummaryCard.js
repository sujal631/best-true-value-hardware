// Import the necessary components
import React from 'react';
import { Card, ListGroup, Row, Col } from 'react-bootstrap';

// Define the OrderSummaryCard functional component, which takes several props including order details and PayPal-related functions
const OrderSummaryCard = ({ order }) => {
  // Define an array of objects containing labels and values for displaying order details
  const orderDetails = [
    { label: 'Item(s)', value: order.itemsPrice.toFixed(2) },
    { label: 'Tax', value: order.taxPrice.toFixed(2) },
    { label: 'Order Total', value: order.totalPrice.toFixed(2), isTotal: true },
  ];

  return (
    <Card className="mb-5">
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
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

// Export the OrderSummaryCard component as the default export
export default OrderSummaryCard;
