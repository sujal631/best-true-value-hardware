import React from 'react';
import { Container, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';

export default function Navigation() {
  return (
    <div>
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="brand">
              <img
                src={require('../logo.png')}
                alt="Logo"
                style={{
                  width: '60px',
                  height: '50px',
                  marginRight: '10px',
                }}
              />
              Best True Value Hardware
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="right-nav">
              <LinkContainer to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products">
                <Nav.Link>Products</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/about">
                <Nav.Link>About</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/cart">
                <Nav.Link>Cart</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/login">
                <Nav.Link>Log In</Nav.Link>
              </LinkContainer>

              <NavDropdown title="Customer" id="basic-nav-dropdown">
                <LinkContainer to="/profile">
                  <NavDropdown.Item className="nav-dropdown">
                    Profile
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/orderHistory">
                  <NavDropdown.Item className="nav-dropdown">
                    Order History
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              <NavDropdown title="Admin" id="basic-nav-dropdown">
                <LinkContainer to="/dashboard">
                  <NavDropdown.Item className="nav-dropdown">
                    Dashboard
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/listProducts">
                  <NavDropdown.Item className="nav-dropdown">
                    List Products
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/listOrders">
                  <NavDropdown.Item className="nav-dropdown">
                    Orders
                  </NavDropdown.Item>
                </LinkContainer>
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
