import React, { useContext } from 'react';
import { Badge, Container, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Nav from 'react-bootstrap/Nav';
import { Store } from '../Store';
import { Link } from 'react-router-dom';
import Search from './Search';

// This component returns the navigation bar for the website
export default function Navigation() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const logout = () => {
    ctxDispatch({ type: 'LOGOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingInfo');
    localStorage.removeItem('paymentMethod');
    window.location.href = 'login';
  };

  return (
    <div>
      {/* Dark themed navbar fixed to the top of the page */}
      <Navbar bg="black" variant="dark" expand="lg" fixed="top">
        <Container>
          {/* Navbar Brand */}
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
            <span className="d-none d-lg-block">Best True Value Hardware</span>
          </Navbar.Brand>
          <div>
            <Search />
          </div>

          {/* Navbar Toggler */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          {/* Navbar Collapse */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="right-nav col-md-12">
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

              {userInfo ? (
                <NavDropdown title={userInfo.firstName} id="basic-nav-dropdown">
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
        </Container>
      </Navbar>
    </div>
  );
}
