//Importing necessary dependencies
import React, { useContext, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Sending a login request to server using Axios
    Axios.post('/api/users/login', { email, password })
      .then(({ data }) => {
        // Updating global context API state with logged-in user info
        dispatch({ type: 'LOGIN', payload: data });
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate(redirect); // Navigating to the redirected URL after successful login
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      });
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
        {/* Form component that allows user to log in */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Password input */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* Log in button */}
          <div className="d-grid gap-2 mb-3">
            <button type="submit" className="btn btn-primary">
              Log In
            </button>
          </div>
          {/* Link to registration page */}
          <div className="mb-3">
            New Customer?{' '}
            <Link to={`/registration?redirect=${redirect}`}>
              Register Here!
            </Link>
          </div>
        </form>
      </Container>
    </div>
  );
}
