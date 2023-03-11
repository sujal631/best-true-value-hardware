//Import necessary modules
import axios from 'axios';
import React, { useReducer, useState } from 'react';
import { useContext } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';

// Define reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loadingUpdate: true };
    case 'SUCCESS':
    case 'FAILURE':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

// Define the ProfilePage component
export default function ProfilePage() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  // Initialize form input values using user info
  const [firstName, setFirstName] = useState(userInfo.firstName);
  const [lastName, setLastName] = useState(userInfo.lastName);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Initialize the reducer for handling loading state
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Define async function to update user profile
  const updateUserProfile = async () => {
    const userData = { firstName, lastName, email, password };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      const { data } = await axios.put('/api/users/profile', userData, config);
      dispatch({ type: 'SUCCESS' });
      ctxDispatch({ type: 'LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Update Successful');
    } catch (error) {
      dispatch({ type: 'FAILURE' });
      toast.error(getErrorMessage(error));
    }
  };

  // Define function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if password fields are empty
    if (password === '' || confirmPassword === '') {
      return toast.error('Please enter a password and confirm it.');
    }

    // Check if password fields match
    if (password !== confirmPassword) {
      return toast.error('New Password and Confirm New Password do not match.');
    }
    // Call async function to update user profile
    updateUserProfile();
  };
  return (
    <Container className="container small-container">
      {/* Set the title of the page to "User Profile" */}
      <Helmet>
        <title>Your Profile</title>
      </Helmet>

      {/* Display the page header */}
      <h1 className="my-3">Your Profile</h1>

      {/* Form with the function handleSubmit being called on submit */}
      <Form onSubmit={handleSubmit}>
        {/* A form input for the user's first name */}
        <div className="mb-3">
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
        <div className="mb-3">
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
            onChange={(e) => {
              const { value } = e.target;
              let errorMessage = '';

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
              if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address.';
              }
              setEmail(value);
              e.target.setCustomValidity(errorMessage);
            }}
            value={email}
          />
        </div>

        {/* A form input for the user's password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            onChange={(e) => {
              const { value } = e.target;
              let errorMessage = '';

              // Check if password meets requirements
              const hasUppercase = /[A-Z]/.test(value);
              const hasLowercase = /[a-z]/.test(value);
              const hasNumberOrSpecial =
                /[\d!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(value);

              if (value.length < 8) {
                errorMessage = 'Password must be at least 8 characters long.';
              } else if (!hasUppercase) {
                errorMessage =
                  'Password must include at least one uppercase letter.';
              } else if (!hasLowercase) {
                errorMessage =
                  'Password must include at least one lowercase letter.';
              } else if (!hasNumberOrSpecial) {
                errorMessage =
                  'Password must include at least one number or special character.';
              }
              setPassword(value);
              e.target.setCustomValidity(errorMessage);
            }}
            value={password}
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
            Confirm New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />
        </div>

        {/* Update button that triggers handleSubmit function */}
        <div className="d-grid gap-2 mb-3">
          <Button type="submit">UPDATE</Button>
        </div>
      </Form>
    </Container>
  );
}
