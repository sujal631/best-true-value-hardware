//Importing necessary dependencies
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils';

// React component for login page
export default function LogInPage() {
  const navigate = useNavigate();
  // Using `useLocation` hook from `react-router-dom` for getting current URL location
  const { search } = useLocation();
  // Getting the URL parameter for redirecting after login
  const redirect = new URLSearchParams(search).get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {
    state: { userInfo }, // Getting user info from global context API
    dispatch,
  } = useContext(Store);

  // Handling the form submission event
  const handleSubmit = async (e) => {
    e.preventDefault(); // Preventing default form submission
    try {
      // Sending a login request to server using Axios
      const { data } = await Axios.post('/api/users/login', {
        email,
        password,
      });
      // Updating global context API state with logged-in user info
      dispatch({ type: 'LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect); // Navigating to the redirected URL after successful login
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Checking if user is already logged in
  useEffect(() => {
    if (userInfo) {
      // Navigating to the redirected URL if user is already logged in
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  // Rendering the login form and form inputs
  return (
    <div>
      <Container className="container small-container">
        {/* Setting the page title using react-helmet-async */}
        <Helmet>
          <title>Log In</title>
        </Helmet>
        <h1 className="my-3">Log In</h1>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <div className="d-grid gap-2 mb-3">
            <Button type="submit">Log In</Button>
          </div>
          <div className="mb-3">
            New Customer?{' '}
            <Link to={`/registration?redirect=${redirect}`}>
              Register Here!
            </Link>
          </div>
        </Form>
      </Container>
    </div>
  );
}
