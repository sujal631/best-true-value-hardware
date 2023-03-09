// Importing necessary packages from react-bootstrap and react-router
import React, { useContext } from 'react';
import {
  Badge,
  Container,
  Navbar,
  NavDropdown,
  Row,
  Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import Search from './Search';

// This component returns the navigation bar for the website
export default function Navigation() {
  // Using the useContext hook to access the global state and dispatch functions from the Store component
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  // Function to handle user logout
  const logout = () => {
    // Dispatching the LOGOUT action to the global state
    ctxDispatch({ type: 'LOGOUT' });
    ['userInfo', 'shippingInfo', 'paymentMethod'].forEach((key) =>
      localStorage.removeItem(key)
    );
    // Redirecting to the login page
    window.location.href = 'login';
  };

  // Rendering the navigation bar
  return (
    <div>
      {/* Dark themed navbar fixed to the top of the page */}
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container>
          <Row className="w-100 align-items-center">
            {/* Brand Column */}
            <Col xs={4} className="d-flex align-items-center">
              {/* Displaying the website logo and brand name */}
              <Navbar.Brand className="brand d-flex align-items-center">
                {/* Logo */}
                <img
                  src={require('../logo.png')}
                  alt="Logo"
                  style={{
                    width: '90px',
                    height: '75px',
                  }}
                />
                {/* Brand Name */}
                <span className="d-none d-lg-block">
                  Best True Value Hardware
                </span>
              </Navbar.Brand>
            </Col>

            {/* Search Column */}
            <Col xs={4} className="d-flex justify-content-center">
              <Search />
            </Col>

            {/* Links Column */}
            <Col xs={4} className="d-flex justify-content-end">
              {/* Navbar Toggler */}
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />

              {/* Navbar Collapse */}
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="right-nav d-flex ">
                  {/* Home Link */}
                  <Link to="/" className="nav-link">
                    Home
                  </Link>

                  {/* Products Link */}
                  <Link to="/products" className="nav-link">
                    Products
                  </Link>

                  {/* About Link */}
                  <Link to="/about" className="nav-link">
                    About
                  </Link>

                  {/* Rendering user related dropdown menu if the user is logged in, else rendering the login link */}
                  {userInfo ? (
                    <NavDropdown
                      title={userInfo.firstName}
                      id="basic-nav-dropdown"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/orderHistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link className="dropdown-item" to="/" onClick={logout}>
                        Log Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <LinkContainer to="/login">
                      <Nav.Link>Log In</Nav.Link>
                    </LinkContainer>
                  )}

                  {/* Cart Link */}
                  <Link to="/cart" className="nav-link">
                    <i className="fa fa-shopping-cart"></i>
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                </Nav>
              </Navbar.Collapse>
            </Col>
          </Row>
        </Container>
      </Navbar>
    </div>
  );
}
