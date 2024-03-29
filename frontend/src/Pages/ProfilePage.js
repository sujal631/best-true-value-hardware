//Import necessary modules and dependencies
import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import { useContext } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import { useRef } from 'react';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

// Define the default state of the reducer
const initialState = {
  loadingUpdate: false,
};

// Map the action types to specific functions to update the state
const actionsMap = {
  // Update the loadingUpdate state to true
  REQUEST: (state) => ({ ...state, loadingUpdate: true }),
  // Set the loadingUpdate state to false for both success and failure cases
  SUCCESS: (state) => ({ ...state, loadingUpdate: false }),
  FAILURE: (state) => ({ ...state, loadingUpdate: false }),
};

// Reducer function for handling state updates based on dispatched actions
const reducer = (state = initialState, action) => {
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

// ProfilePage component
export default function ProfilePage() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  // Declare state variables for user information and form fields
  const [firstName, setFirstName] = useState(userInfo.firstName);
  const [lastName, setLastName] = useState(userInfo.lastName);
  const [phoneNumber, setPhoneNumber] = useState(userInfo.phoneNumber);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' });
  const [toastId, setToastId] = useState(null);
  const oldPasswordRef = useRef(null);
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, initialState);

  // Add state variables to control edit mode and password change mode
  const [editMode, setEditMode] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Show toast messages based on the type and message
  useEffect(() => {
    if (toastMessage.type !== '') {
      let newToastId;
      if (toastMessage.type === 'success') {
        newToastId = toast.success(toastMessage.message);
      } else if (toastMessage.type === 'error') {
        newToastId = toast.error(toastMessage.message);
      }
      setToastId(newToastId);
      setToastMessage({ type: '', message: '' });
    }
  }, [toastMessage.type, toastMessage.message]);

  // Helper function to display toast messages
  const showToast = (type, message) => {
    setToastMessage({ type, message });
  };

  // Helper function to validate email
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  // Helper function to validate phone number
  const isPhoneNumberValid = (phoneNumber) => {
    const phoneNumberRegex = /^\+\d{1,3}\d{10}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  // verifyOldPassword function: checks if the old password is correct
  const verifyOldPassword = async () => {
    const userData = { password: oldPassword };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      await axios.post('/api/users/profile/verify-password', userData, config);
      return true;
    } catch (error) {
      return false;
    }
  };

  // updateUserInfo function: sends a request to update user information
  const updateUserInfo = async () => {
    const userData = { firstName, lastName, email, phoneNumber };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      const { data } = await axios.put(
        '/api/users/profile/info',
        userData,
        config
      );
      dispatch({ type: 'SUCCESS' });
      ctxDispatch({ type: 'LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Update Successful');
    } catch (error) {
      dispatch({ type: 'FAILURE' });
      toast.error(getErrorMessage(error));
    }
  };

  // updatePassword function: sends a request to update the user's password
  const updatePassword = async () => {
    const userData = { password };
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      const { data } = await axios.put(
        '/api/users/profile/password',
        userData,
        config
      );
      dispatch({ type: 'SUCCESS' });
      ctxDispatch({ type: 'LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setToastMessage({
        type: 'success',
        message: 'Password Update Successful',
      });
      setToastId(null);
    } catch (error) {
      // ...
      setToastMessage({ type: 'error', message: getErrorMessage(error) });
      setToastId(null);
    }
  };

  // handleSaveClick function: validates inputs and updates user information
  const handleSaveClick = async () => {
    if (editMode) {
      if (!isEmailValid(email)) {
        showToast('error', 'Please enter a valid email address.');
        return;
      }

      if (!isPhoneNumberValid(phoneNumber)) {
        showToast(
          'error',
          'Please enter a valid phone number, including the country code and a 10-digit number.'
        );
        return;
      }

      const oldPasswordValid = await verifyOldPassword();
      if (oldPasswordValid) {
        updateUserInfo();
        setEditMode(false);
        setOldPassword('');
      } else {
        showToast('error', 'Incorrect Password.');
        oldPasswordRef.current.focus();
      }
    }
  };

  // handleUpdatePasswordClick function: validates inputs and updates the user's password
  const handleUpdatePasswordClick = async (e) => {
    e.preventDefault();

    if (password === '' || confirmPassword === '' || oldPassword === '') {
      showToast('error', 'Please fill out all password fields.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'New Password and Confirm New Password do not match.');
      return;
    }

    const oldPasswordValid = await verifyOldPassword();
    if (oldPasswordValid) {
      updatePassword();
      setPasswordChangeMode(false);
      // Clear password fields after a successful update
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
    } else {
      showToast('error', 'Incorrect Old Password.');
    }
  };

  return (
    <Container className="container small-container">
      {/* Set the page title */}
      <Helmet>
        <title>Your Profile</title>
      </Helmet>

      {/* Page heading */}
      <h1 className="my-3">Your Profile</h1>

      {/* User information form */}
      <Form>
        {/* First name and last name input fields in a row */}
        <div className="row">
          {/* First name input */}
          <div className=" col-md-6 mb-2">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              required
              disabled={!editMode}
              readOnly={!editMode}
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </div>

          {/* Last name input */}
          <div className=" col-md-6 mb-2">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              required
              disabled={!editMode}
              readOnly={!editMode}
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </div>
        </div>
        {/* Phone number input */}
        <div className="mb-2">
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            className="form-control"
            id="phoneNumber"
            required
            disabled={!editMode}
            readOnly={!editMode}
            onChange={(e) => setPhoneNumber(e.target.value)}
            value={phoneNumber}
            pattern="^\+\d{1,3}\d{10}$"
            title="Phone number should include a country code (1-3 digits) followed by a 10-digit number"
          />
        </div>
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
            disabled={!editMode}
            readOnly={!editMode}
            onChange={(e) => {
              const { value } = e.target;
              let errorMessage = '';

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
        {/* Confirm password input (for editing user info) */}
        {editMode && (
          <div className="mb-3 position-relative">
            <label htmlFor="oldPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="form-control"
              id="oldPassword"
              ref={oldPasswordRef}
              onChange={(e) => setOldPassword(e.target.value)}
              value={oldPassword}
              style={{ paddingRight: '40px' }}
            />
            {/* Eye icon */}
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-5%)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#bb0000',
                opacity: oldPassword.length > 0 ? 1 : 0,
                transition: 'opacity 0.4s',
              }}
            >
              {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
            </span>
          </div>
        )}
        {/* Old password input (for updating the password) */}
        {passwordChangeMode && (
          <>
            <div className="mb-2 position-relative">
              <label htmlFor="oldPasswordUpdate" className="form-label">
                Old Password
              </label>
              <input
                type={showOldPassword ? 'text' : 'password'}
                className="form-control"
                id="oldPasswordUpdate"
                onChange={(e) => setOldPassword(e.target.value)}
                value={oldPassword}
                style={{ paddingRight: '40px' }}
              />
              {/* Eye icon */}
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-5%)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: '#bb0000',
                  opacity: oldPassword.length > 0 ? 1 : 0,
                  transition: 'opacity 0.4s',
                }}
              >
                {showOldPassword ? <EyeSlashFill /> : <EyeFill />}
              </span>
            </div>
          </>
        )}
        {/* New password input */}
        {passwordChangeMode && (
          <>
            <div className="mb-2 position-relative">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                onChange={(e) => {
                  const { value } = e.target;
                  let errorMessage = '';

                  const hasUppercase = /[A-Z]/.test(value);
                  const hasLowercase = /[a-z]/.test(value);
                  const hasNumberOrSpecial =
                    /[\d!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(value);

                  if (value.length < 8) {
                    errorMessage =
                      'Password must be at least 8 characters long.';
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
                style={{ paddingRight: '40px' }}
              />
              {/* Eye icon */}
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-5%)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: '#bb0000',
                  opacity: password.length > 0 ? 1 : 0,
                  transition: 'opacity 0.4s',
                }}
              >
                {showNewPassword ? <EyeSlashFill /> : <EyeFill />}
              </span>
            </div>
            {/* Password requirements message */}
            {password.length > 0 && (
              <div className="mb-3">
                <Message variant="warning">
                  Please note that the password you create must meet the
                  following requirements: <br />
                  &emsp;At least 8 characters long <br />
                  &emsp;Includes at least one lowercase letter <br />
                  &emsp;Includes at least one uppercase letter <br />
                  &emsp;Includes at least one number or special character
                </Message>
              </div>
            )}

            {/* Confirm new password input */}
            <div className="mb-3 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                className="form-control"
                id="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
              {/* Eye icon */}
              <span
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-5%)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: '#bb0000',
                  opacity: confirmPassword.length > 0 ? 1 : 0,
                  transition: 'opacity 0.4s',
                }}
              >
                {showConfirmNewPassword ? <EyeSlashFill /> : <EyeFill />}
              </span>
            </div>
          </>
        )}
        {/* Conditionally render buttons based on editMode and passwordChangeMode */}
        {/* Edit and Change Password buttons when not in editMode or passwordChangeMode */}{' '}
        {!editMode && !passwordChangeMode && (
          <>
            <div className="d-grid gap-2 mb-3">
              <Button onClick={() => setEditMode(true)}>Edit Your Info</Button>
            </div>
            <div className="d-grid gap-2 mb-3">
              <Button onClick={() => setPasswordChangeMode(true)}>
                Change Password
              </Button>
            </div>
          </>
        )}
        {/* Update Your Info and Cancel buttons when in editMode */}
        {editMode && (
          <div className="d-grid gap-2 mb-3">
            <Button type="button" onClick={handleSaveClick}>
              Update Your Info
            </Button>
            <Button
              onClick={() => {
                setEditMode(false);
                setOldPassword(''); // Clear oldPassword state
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        {/* Update Password and Cancel buttons when in passwordChangeMode */}
        {passwordChangeMode && (
          <div className="d-grid gap-2 mb-3">
            <Button type="button" onClick={handleUpdatePasswordClick}>
              Update Password
            </Button>
            <Button
              onClick={() => {
                setPasswordChangeMode(false);
                // Clear password fields when user cancels password update
                setOldPassword('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </Container>
  );
}
