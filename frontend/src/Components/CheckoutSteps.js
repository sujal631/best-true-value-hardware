// Import necessary modules
import React from 'react';
import { Col, Row } from 'react-bootstrap';

// Functional component called CheckoutSteps
export default function CheckoutSteps(props) {
  // Array of objects called 'steps' that contains name of each steps
  const steps = [
    { name: 'Log In', active: props.step1 },
    { name: 'Shipping Info', active: props.step2 },
    { name: 'Payment Method', active: props.step3 },
    { name: 'Preview Order', active: props.step4 },
  ];

  return (
    <Row className="checkout-steps">
      {/* Iterate through each element of the steps array*/}
      {steps.map((step) => (
        // className is determined by value of 'step.active'
        // if it is true, the className will be active, else it will be an empty string
        <Col key={step.name} className={step.active ? 'active' : ''}>
          {step.name}
        </Col>
      ))}
    </Row>
  );
}
