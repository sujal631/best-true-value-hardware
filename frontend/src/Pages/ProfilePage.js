import axios from 'axios';
import React, { useReducer, useState } from 'react';
import { useContext } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';

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

export default function ProfilePage() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [firstName, setFirstName] = useState(userInfo.firstName);
  const [lastName, setLastName] = useState(userInfo.lastName);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Add state variables to control edit mode and password change mode
  const [editMode, setEditMode] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  const updateUserInfo = async () => {
    const userData = { firstName, lastName, email };
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
      toast.success('Password Update Successful');
    } catch (error) {
      dispatch({ type: 'FAILURE' });
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveClick = () => {
    if (editMode) {
      updateUserInfo();
      setEditMode(false);
    }
  };

  const handleUpdatePasswordClick = (e) => {
    e.preventDefault();

    if (password === '' || confirmPassword === '') {
      return toast.error('Please enter a password and confirm it.');
    }

    if (password !== confirmPassword) {
      return toast.error('Password and Confirm Password do not match.');
    }

    updatePassword();
    setPasswordChangeMode(false);
  };

  return (
    <Container className="container small-container">
      <Helmet>
        <title>Your Profile</title>
      </Helmet>

      <h1 className="my-3">Your Profile</h1>

      <Form>
        <div className="mb-3">
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

        <div className="mb-3">
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

        {/* Conditionally render the password fields if passwordChangeMode is true */}
        {passwordChangeMode && (
          <>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
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

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>
          </>
        )}

        {/* Conditionally render buttons based on editMode and passwordChangeMode */}
        {!editMode && !passwordChangeMode && (
          <>
            <div className="d-grid gap-2 mb-3">
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            </div>
            <div className="d-grid gap-2 mb-3">
              <Button onClick={() => setPasswordChangeMode(true)}>
                Change Password
              </Button>
            </div>
          </>
        )}

        {editMode && (
          <div className="d-grid gap-2 mb-3">
            <Button onClick={() => setEditMode(false)}>Cancel</Button>
            <Button type="button" onClick={handleSaveClick}>
              Update Your Profile
            </Button>
          </div>
        )}

        {passwordChangeMode && (
          <div className="d-grid gap-2 mb-3">
            <Button onClick={() => setPasswordChangeMode(false)}>Cancel</Button>
            <Button type="button" onClick={handleUpdatePasswordClick}>
              Update Password
            </Button>
          </div>
        )}
      </Form>
    </Container>
  );
}
