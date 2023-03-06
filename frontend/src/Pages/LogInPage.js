import React from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';

export default function LogInPage() {
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';
  return (
    <div>
      <Container className="small-container">
        {/* Setting the page title using react-helmet-async */}
        <Helmet>
          <title>Log In</title>
        </Helmet>
        <h1 className="my-3">Log In</h1>
        <Form>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" required />
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
