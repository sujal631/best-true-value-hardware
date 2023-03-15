// Import necessary modules
import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import Message from '../Components/MessageComponent';

export default function Registration() {
  const navigate = useNavigate();
  // Get the search query string from the URL
  const { search } = useLocation();
  // Get the "redirect" parameter from the query string
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  // Set up state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Extract values from form data
  const { firstName, lastName, email, password, confirmPassword } = formData;

  // Get state and dispatch from the global store
  const { state, dispatch } = useContext(Store);
  const userInfo = state.userInfo; // extract user info from state

  // Function to handle changes to form inputs
  const handleChange = (e) => {
    // Extract input id and value
    const { id, value } = e.target;
    let errorMessage = '';

    // Validate email if the input id is "email"
    if (id === 'email') {
      // Check if email format is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid email address.';
      }
    }

    // Validate password if the input id is "password"
    if (id === 'password') {
      // Check if password meets requirements
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumberOrSpecial = /[\d!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(
        value
      );

      if (value.length < 8) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (!hasUppercase) {
        errorMessage = 'Password must include at least one uppercase letter.';
      } else if (!hasLowercase) {
        errorMessage = 'Password must include at least one lowercase letter.';
      } else if (!hasNumberOrSpecial) {
        errorMessage =
          'Password must include at least one number or special character.';
      }
    }

    // Update form data with new value
    setFormData({
      ...formData,
      [id]: value,
    });
    // Set custom validation error message
    e.target.setCustomValidity(errorMessage);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if password fields are empty
    if (password === '' || confirmPassword === '') {
      toast.error('Please enter a password and confirm it.');
      return;
    }

    // Check if password fields match
    if (password !== confirmPassword) {
      toast.error('Password and Confirm Password do not match.');
      return;
    }

    try {
      // Send registration data to the server
      const response = await fetch('/api/users/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        // Throw an error if the response is not ok
        throw new Error('Failed to register user.');
      }
      // Extract data from the response
      const data = await response.json();
      dispatch({ type: 'LOGIN', payload: data });
      // Store user info in local storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (error) {
      // display an error message if registration fails
      toast.error('Failed to register user. Please try again later.');
    }
  };

  // Effect hook to check if user is already logged in and redirect if necessary
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="container small-container">
      {/* Set the title of the page to "Registration" */}
      <Helmet>
        <title>Registration</title>
      </Helmet>
      {/* Header of the page */}
      <h1 className="my-3">Registration</h1>

      {/* Form with the function handleSubmit being called on submit */}
      <Form onSubmit={handleSubmit}>
        <div className="row">
          <div className=" col-md-6 mb-3">
            {/* A form input for the user's first name */}
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              required
              onChange={handleChange}
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
              onChange={handleChange}
              value={lastName}
            />
          </div>
        </div>

        {/* A form input for the user's email address */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            required
            onChange={handleChange}
            value={email}
          />
        </div>

        {/* A form input for the user's password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            required
            onChange={handleChange}
            value={formData.password}
          />
        </div>
        <div className="mb-3">
          <Message variant="warning">
            Please note that the password you create must meet the following
            requirements: <br />
            &emsp;At least 8 characters long <br />
            &emsp;Includes at least one lowercase letter <br />
            &emsp;Includes at least one uppercase letter <br />
            &emsp;Includes at least one number or special character
          </Message>
        </div>

        {/* A form input for the user's confirm password */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            required
            onChange={handleChange}
            value={confirmPassword}
          />
        </div>

        {/* Register button that triggers handleSubmit function */}
        <div className="d-grid gap-2 mb-3">
          <Button type="submit">Register</Button>
        </div>

        {/* Redirect to login page if user already has an account  */}
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`}>Log In!</Link>
        </div>
      </Form>
    </Container>
  );
}
