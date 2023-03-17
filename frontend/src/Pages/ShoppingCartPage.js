// Import necessary dependencies
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import ReactModal from 'react-modal';

// Define ShoppingCartPage component
export default function ShoppingCartPage() {
  // Use the useNavigate hook to get the navigate function for changing routes
  const navigate = useNavigate();
  // Use the useContext hook to get the cartItems and dispatchCartAction from the Store context
  const { cartItems } = useContext(Store).state.cart;
  const dispatchCartAction = useContext(Store).dispatch;

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '200px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
  };

  // Define a function to calculate the subtotal of the cart items
  const calculateCartSubtotal = (items) =>
    `$${items
      .reduce((total, { price, quantity }) => total + price * quantity, 0)
      .toFixed(2)}`;

  // Define a function to handle updating the cart when the quantity of an item is changed
  const handleUpdateCart = async (item, quantity) => {
    // Send a GET request to the server to check if the item is in stock
    const { data } = await axios.get(`api/products/${item._id}`);
    // If the item is out of stock, show an alert to the user
    if (data.countInStock < quantity) {
      setModalIsOpen(true);
      return;
    }
    // Dispatch the ADD_ITEM action to add the item to the cart with the updated quantity
    dispatchCartAction({ type: 'ADD_ITEM', payload: { ...item, quantity } });
  };

  // Define a function to handle removing an item from the cart
  const handleRemoveItem = (item) => {
    dispatchCartAction({ type: 'REMOVE_ITEM', payload: item });
  };

  // Define a function to handle navigating to the checkout page
  const handleCheckout = () => {
    navigate('/login?redirect=/shippingInfo');
  };

  // Define a function that displays the calculated subtotal for the cart items
  const Subtotal = ({ cartItems, calculateCartSubtotal }) => (
    <h4>Subtotal: {calculateCartSubtotal(cartItems)}</h4>
  );

  // Define a function called CheckoutButton that displays the checkout button and handles its click event
  const CheckoutButton = ({ cartItems, handleCheckout }) => (
    <div className="d-grid">
      <Button
        variant="primary"
        onClick={handleCheckout}
        type="button"
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
    </div>
  );

  // Define a OrderSummary function that displays the order summary with the subtotal and checkout button
  const OrderSummary = ({
    cartItems,
    calculateCartSubtotal,
    handleCheckout,
  }) => (
    <Card>
      <Card.Body>
        <Card.Title>Order Summary</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>
            {/* Displays the subtotal of the cart using the calculateCartSubtotal function */}
            <Subtotal
              cartItems={cartItems}
              calculateCartSubtotal={calculateCartSubtotal}
            />
          </ListGroup.Item>
          <ListGroup.Item>
            {/* Button that calls the handleCheckout function on click */}
            <CheckoutButton
              cartItems={cartItems}
              handleCheckout={handleCheckout}
            />
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );

  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Shopping Cart</h1>

      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customStyles}
      >
        <h4>Out of Stock</h4>
        <p>Sorry, this product is out of stock.</p>
        <Button variant="primary" onClick={() => setModalIsOpen(false)}>
          Close
        </Button>
      </ReactModal>

      <Row>
        <Col xs={12} lg={8}>
          {/* If the cart is empty, show a message and a button to keep shopping */}
          {cartItems.length === 0 ? (
            <Message variant="warning">
              Oops, there are no items in your bag.{' '}
              <Button variant="warning" onClick={() => navigate('/')}>
                KEEP SHOPPING ?
              </Button>{' '}
            </Message>
          ) : (
            // Otherwise, show the list of cart items
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col xs={12} lg={12} className="mb-3">
                      {/* Show the item image and name */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail d-block mb-1"
                        style={{ maxWidth: '80px', maxHeight: '80px' }}
                      />
                      <Link
                        className="remove-link-style"
                        to={`/product/${item.slug}`}
                      >
                        <strong>{item.name}</strong>
                      </Link>
                    </Col>

                    <Col xs={12} lg={4} className="mb-1  btn-text">
                      {/* Show the item price */}
                      Price: ${item.price}
                    </Col>

                    <Col xs={12} lg={4} className="mb-1 ">
                      {/* Remove item button */}
                      <Button
                        onClick={() => handleRemoveItem(item)}
                        variant="light"
                      >
                        <i className="fa fa-trash btn-text">
                          {' '}
                          <span
                            className="btn-text"
                            style={{ padding: '0 5px', fontWeight: '100' }}
                          >
                            Remove
                          </span>
                        </i>
                      </Button>
                    </Col>
                    <Col xs={12} lg={4} className="mb-1 ">
                      {/* Decrease and increase item quantity buttons */}
                      <Button
                        variant="light"
                        className="btn-text"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          handleUpdateCart(item, item.quantity - 1)
                        }
                      >
                        <i className="fas fa-minus-circle "></i>
                      </Button>{' '}
                      <span className="btn-text" style={{ margin: '0 8px' }}>
                        Qty: {item.quantity}
                      </span>{' '}
                      <Button
                        variant="light"
                        className="btn-text"
                        disabled={item.quantity === item.countInStock}
                        onClick={() =>
                          handleUpdateCart(item, item.quantity + 1)
                        }
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>{' '}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col xs={12} lg={4}>
          {/* Renders the OrderSummary component and passes the required props */}
          <OrderSummary
            cartItems={cartItems}
            calculateCartSubtotal={calculateCartSubtotal}
            handleCheckout={handleCheckout}
          />
        </Col>
      </Row>
    </div>
  );
}
