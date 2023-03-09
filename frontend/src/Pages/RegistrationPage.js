import React, { useContext, useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils';

export default function Registration() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const { state: { userInfo } = {}, dispatch } = useContext(Store);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Password field and confirm password field do not match.');
      return;
    }
    try {
      const { data } = await Axios.post('/api/users/registration', formData);
      dispatch({ type: 'LOGIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="container small-container">
      <Helmet>
        <title>Registration</title>
      </Helmet>
      <h1 className="my-3">Registration</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control value={firstName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control value={lastName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <div className="d-grid gap-2 mb-3">
          <Button type="submit">Register</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`}>Log In!</Link>
        </div>
      </Form>
    </Container>
  );
}
