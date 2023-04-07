// Import React, UI components from react-bootstrap, and Font Awesome icons
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookSquare,
  faTwitterSquare,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';

// This component returns the footer for the website
export default function Footer() {
  return (
    <div className="bg-black variant-dark py-3">
      <Container className="text-center">
        <Row>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={require('../logo.png')}
              alt="Logo"
              style={{
                width: '150px',
                height: '115px',
              }}
            />
          </div>
        </Row>
        <Row>
          {/* Nav Links */}
          <Col sm={12} md={8}>
            <p
              className="footer-text my-2"
              style={{ fontSize: '0.9rem', textAlign: 'left' }}
            >
              &copy; {new Date().getFullYear()} Best True Value Hardware. All
              rights reserved. Developed by Joshi & Dev
            </p>
          </Col>
          {/* Social Media Links */}
          <Col sm={12} md={4}>
            <ul className="list-inline mb-2" style={{ textAlign: 'right' }}>
              <li className="list-inline-item px-2">
                <a
                  href="https://www.facebook.com/TrueValue"
                  target={'self'}
                  className="text-gray"
                >
                  <FontAwesomeIcon icon={faFacebookSquare} size="2x" />
                </a>
              </li>
              <li className="list-inline-item px-2">
                <a
                  href="https://twitter.com/truevalue"
                  target={'self'}
                  className="text-gray"
                >
                  <FontAwesomeIcon icon={faTwitterSquare} size="2x" />
                </a>
              </li>
              <li className="list-inline-item px-2">
                <a
                  href="https://www.linkedin.com/company/true-value-company"
                  target={'self'}
                  className="text-gray"
                >
                  <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
