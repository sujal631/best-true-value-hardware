import React, { useContext, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../Components/CheckoutSteps';
import { Store } from '../Store';

export default function ShippingInfoPage() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingInfo },
  } = state;
  const [firstName, setFirstName] = useState(shippingInfo.firstName || '');
  const [lastName, setLastName] = useState(shippingInfo.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(
    shippingInfo.phoneNumber || ''
  );
  const [address, setAddress] = useState(shippingInfo.address || '');
  const [city, setCity] = useState(shippingInfo.city || '');
  const [region, setRegion] = useState(shippingInfo.region || '');
  const [zip, setZip] = useState(shippingInfo.zip || '');
  const [country, setCountry] = useState(shippingInfo.country || '');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/shippingInfo');
    }
  }, [userInfo, navigate]);
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SHIPPING_INFO',
      payload: {
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        region,
        zip,
        country,
      },
    });
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
        country,
      })
    );
    navigate('/paymentMethod');
  };
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Shipping Info</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        {/* Displaying the page header */}
        <h1 className="my-3">Shipping Info </h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="region">
            <Form.Label>State</Form.Label>
            <Form.Control
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="zip">
            <Form.Label>Zip Code</Form.Label>
            <Form.Control
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
