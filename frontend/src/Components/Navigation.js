// Import React and the required UI components from react-bootstrap library
import React, { useContext } from 'react';
import { Badge, Container, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { Store } from '../Store';

// This component returns the navigation bar for the website
export default function Navigation() {
  const { state } = useContext(Store);
  const { cart } = state;
  return (
    <div>
      {/* Dark themed navbar fixed to the top of the page */}
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container>
          {/* Navbar Brand */}

          <Navbar.Brand className="brand">
            {/* Logo */}
            <img
              src={require('../logo.png')}
              alt="Logo"
              style={{
                width: '60px',
                height: '50px',
                marginRight: '10px',
              }}
            />
            {/* Brand Name */}
            Best True Value Hardware
          </Navbar.Brand>

          {/* Navbar Toggler */}
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          {/* Navbar Collapse */}
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="right-nav">
              {/* Home Link */}
              <LinkContainer to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>

              {/* Products Link */}
              <LinkContainer to="/products">
                <Nav.Link>Products</Nav.Link>
              </LinkContainer>

              {/* About Link */}
              <LinkContainer to="/about">
                <Nav.Link>About Us</Nav.Link>
              </LinkContainer>

              {/* Cart Link */}
              <LinkContainer to="/cart">
                <Nav.Link>
                  Cart
                  {cart.cartItems.length > 0 && (
                    <Badge pill bg="danger">
                      {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {/* Log In Link */}
              <LinkContainer to="/login">
                <Nav.Link>Log In</Nav.Link>
              </LinkContainer>

              {/* Customer Dropdown */}
              <NavDropdown title="Customer" id="basic-nav-dropdown">
                {/* Profile Link */}
                <LinkContainer to="/profile">
                  <NavDropdown.Item className="nav-dropdown">
                    Profile
                  </NavDropdown.Item>
                </LinkContainer>

                {/* Order History Link */}
                <LinkContainer to="/orderHistory">
                  <NavDropdown.Item className="nav-dropdown">
                    Order History
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              {/* Admin Dropdown */}
              <NavDropdown title="Admin" id="basic-nav-dropdown">
                {/* Dashboard Link */}
                <LinkContainer to="/dashboard">
                  <NavDropdown.Item className="nav-dropdown">
                    Dashboard
                  </NavDropdown.Item>
                </LinkContainer>

                {/* List Products Link */}
                <LinkContainer to="/listProducts">
                  <NavDropdown.Item className="nav-dropdown">
                    List Products
                  </NavDropdown.Item>
                </LinkContainer>

                {/* Edit Product Link */}
                <LinkContainer to="/editProduct">
                  <NavDropdown.Item className="nav-dropdown">
                    Edit Product
                  </NavDropdown.Item>
                </LinkContainer>

                {/* List Orders Link */}
                <LinkContainer to="/listOrders">
                  <NavDropdown.Item className="nav-dropdown">
                    Orders
                  </NavDropdown.Item>
                </LinkContainer>

                {/* List Users Link */}
                <LinkContainer to="/listUsers">
                  <NavDropdown.Item className="nav-dropdown">
                    Users
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
