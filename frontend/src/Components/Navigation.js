// Import React and the required UI components from react-bootstrap library
import React from 'react';
import { Container, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';

// This component returns the navigation bar for the website
export default function Navigation() {
  return (
    <div>
      {/* Dark themed navbar fixed to the top of the page */}
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container>
          {/* Navbar Brand */}
          <LinkContainer to="/">
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
          </LinkContainer>

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
                <Nav.Link>About</Nav.Link>
              </LinkContainer>

              {/* Cart Link */}
              <LinkContainer to="/cart">
                <Nav.Link>Cart</Nav.Link>
              </LinkContainer>

              {/* Login Link */}
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
