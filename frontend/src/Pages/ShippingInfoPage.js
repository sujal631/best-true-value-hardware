// Import necessary modules
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../Components/CheckoutSteps';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';

// React component for the Shipping Info page
export default function ShippingInfoPage() {
  // A list of options for the state dropdown menu
  const stateOptions = [
    'Select...',
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ];

  const navigate = useNavigate();
  // Get the global state and dispatch function from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);

  // Get the user info and shipping info from the global state
  const {
    userInfo,
    cart: { shippingInfo },
  } = state;

  // Set up state variables using useState hook for each form input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [zip, setZip] = useState('');
  const [showPhoneMessage, setShowPhoneMessage] = useState(false);
  const [showZipMessage, setShowZipMessage] = useState(false);

  // Use the useEffect hook to set the form inputs to the shipping info stored in the global state
  useEffect(() => {
    if (!userInfo) {
      // If user is not logged in, redirect to login page with redirect parameter
      navigate('/login?redirect=/shippingInfo');
    } else {
      // Set the form input values to the shipping info stored in the global state
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      setPhoneNumber(userInfo.phoneNumber || '');
      setAddress(shippingInfo.address || '');
      setCity(shippingInfo.city || '');
      setRegion(shippingInfo.region || '');
      setZip(shippingInfo.zip || '');
    }
  }, [userInfo, navigate, shippingInfo]);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Dispatch an action to update the shipping info in the global state
    ctxDispatch({
      type: 'SET_SHIPPING_INFO',
      payload: {
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        region,
        zip,
      },
    });

    // Store the shipping info in local storage
    localStorage.setItem(
      'shippingInfo',
      JSON.stringify({
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        region,
        zip,
      })
    );
    // Navigate to the payment method page
    navigate('/paymentMethod');
  };

  // Function to handle phone number input change
  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    setShowPhoneMessage(e.target.value.length > 0);
  };

  // Function to handle zip code input change
  const handleZipChange = (e) => {
    setZip(e.target.value);
    setShowZipMessage(e.target.value.length > 0);
  };

  return (
    <div>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <Container className="container small-container">
        {/* Setting the page title using react-helmet-async */}
        <Helmet>
          <title>Shipping Info</title>
        </Helmet>

        {/* Displaying the page header */}
        <h1 className="my-3">Your Information </h1>

        {/* Render the Shipping Info form */}
        <Form onSubmit={handleSubmit}>
          {/* A form input for the user's first name */}
          <div className="row">
            <div className=" col-md-6 mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                required
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
              />
            </div>

            {/* A form input for the user's last name */}
            <div className=" col-md-6 mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                required
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </div>
          </div>

          {/* A form input for the user's phone number */}
          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              required
              onChange={handlePhoneChange}
              value={phoneNumber}
              pattern="^\+\d{1,3}\d{10}$"
              title="Phone number should include a country code (1-3 digits) followed by a 10-digit number."
            />
          </div>

          {showPhoneMessage && (
            <div className="mb-3 btn-text">
              <Message variant="warning">
                Please provide a valid cell phone number so that a
                representative from the store can call you to{' '}
                <strong>PICKUP</strong> your item(s) when they are ready.
              </Message>
            </div>
          )}

          {/* A form input for the user's physical address */}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              required
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </div>

          {/* A form input for the user's city */}
          <div className="row">
            <div className=" col-md-6 mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                className="form-control"
                id="city"
                required
                onChange={(e) => setCity(e.target.value)}
                value={city}
              />
            </div>

            {/* A form input for the user's state */}
            <div className=" col-md-6 mb-3">
              <label htmlFor="region" className="form-label">
                State
              </label>
              <select
                className="form-control custom-select"
                id="region"
                required
                onChange={(e) => setRegion(e.target.value)}
                value={region}
              >
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* A form input for the user's zip code */}
          <div className="mb-3">
            <label htmlFor="zip" className="form-label">
              Zip Code
            </label>
            <input
              type="text"
              className="form-control"
              id="zip"
              required
              pattern="^\d{5}(?:[-\s]\d{4})?$"
              onChange={handleZipChange}
              value={zip}
              onInvalid={(e) => {
                e.target.setCustomValidity('Please enter a valid zip code');
              }}
              onInput={(e) => {
                e.target.setCustomValidity('');
              }}
            />
            {showZipMessage && (
              <div className="my-3 btn-text">
                <Message variant="warning">
                  Please enter your 5-digit zip code (e.g., 12345) or your
                  9-digit zip code (e.g., 12345-6789).
                </Message>
              </div>
            )}
          </div>

          {/* Submit button that triggers handleSubmit function */}
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </Container>
    </div>
  );
}
