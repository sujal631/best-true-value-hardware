// Importing necessary packages from react-bootstrap and react-router
import React, { useContext, useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);

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

  // Function to create a user dropdown menu based on the user's role (admin or regular user)
  const userDropdownMenu = () => {
    // If the user is an admin, display the admin-specific dropdown menu
    if (userInfo.isAdmin) {
      return (
        <NavDropdown
          title={
            <>
              <span>{userInfo.firstName}</span>
              <Badge
                pill
                bg="danger"
                style={{
                  fontSize: '0.5em',
                  margin: '0',
                  position: 'absolute',
                  top: '-1px',
                  right: '10px',
                }}
              >
                Admin
              </Badge>
            </>
          }
          id="responsive-nav-dropdown "
        >
          {/*Admin Dashboard link */}
          <LinkContainer to="/dashboard" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Dashboard</NavDropdown.Item>
          </LinkContainer>
          {/*Admin Profile link */}
          <LinkContainer to="/profile" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Profile</NavDropdown.Item>
          </LinkContainer>
          {/*Admin Products Management link */}
          <LinkContainer to="/listProducts" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Products</NavDropdown.Item>
          </LinkContainer>
          {/*Admin Orders Management link */}
          <LinkContainer to="/listOrders" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Orders</NavDropdown.Item>
          </LinkContainer>
          {/*Admin Users Management link */}
          <LinkContainer to="/listUsers" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Users</NavDropdown.Item>
          </LinkContainer>
          <NavDropdown.Divider />
          {/*Admin Log Out link */}
          <Link className="dropdown-item" to="/" onClick={logout}>
            Log Out
          </Link>
        </NavDropdown>
      );
    } else {
      // If the user is a regular user, display the user-specific dropdown menu
      return (
        <NavDropdown title={userInfo.firstName} id="responsive-nav-dropdown">
          {/*User Profile link */}
          <LinkContainer to="/profile" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Profile</NavDropdown.Item>
          </LinkContainer>
          {/*User Order History link */}
          <LinkContainer to="/orderHistory" onClick={() => setExpanded(false)}>
            <NavDropdown.Item>Orders</NavDropdown.Item>
          </LinkContainer>
          <NavDropdown.Divider />
          {/*User Log Out link */}
          <Link className="dropdown-item" to="/" onClick={logout}>
            Log Out
          </Link>
        </NavDropdown>
      );
    }
  };

  // Conditionally render the user or admin dropdown menu if the user is logged in, otherwise, display the Log In link
  const User_AdminLinks = userInfo ? (
    userDropdownMenu()
  ) : (
    <LinkContainer to="/login">
      <Nav.Link>Log In</Nav.Link>
    </LinkContainer>
  );

  // Rendering the navigation bar
  return (
    <div>
      {/* Dark themed navbar fixed to the top of the page */}
      <Navbar
        bg="black"
        variant="dark"
        expand="lg"
        fixed="top"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        className="navbar-dark"
      >
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
            <Col xs={3} className="d-flex justify-content-center">
              <Search />
            </Col>

            {/* Links Column */}
            <Col xs={5} className="d-flex justify-content-end">
              {/* Navbar Toggler */}
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />

              {/* Navbar Collapse */}
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="right-nav d-flex ">
                  {/* Home Link */}
                  <Link
                    to="/"
                    className="nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    Home
                  </Link>
                  {/* Products Link */}
                  <Link
                    to="/products"
                    className="nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    Products
                  </Link>
                  {/* About Link */}
                  <Link
                    to="/about"
                    className="nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    About
                  </Link>

                  {/* Rendering user/admin related dropdown menu if the user/admin is logged in, else rendering the login link */}
                  <Nav className="ml-auto">{User_AdminLinks}</Nav>

                  {/* Cart Link */}
                  <Link
                    to="/cart"
                    className="nav-link"
                    onClick={() => setExpanded(false)}
                  >
                    <span>
                      <i className="fa fa-shopping-basket"></i>
                    </span>
                    {cart.cartItems.length > 0 && (
                      <Badge
                        pill
                        bg="danger"
                        style={{
                          fontSize: '0.6rem',
                        }}
                      >
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
