//Import necessary modules
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import HoursOfOperation from '../Components/HoursOfOperation';

const AboutPage = () => {
  // function to handle phone call when phone number is clicked
  const handleCall = () => {
    window.location.href = 'tel:3372408312';
  };

  // function to handle email when email address is clicked
  const handleEmail = () => {
    window.location.href = 'mailto:besttruevalue@gmail.com';
  };

  return (
    <div>
      {/* Set the title of the page */}
      <Helmet>
        <title>About BEST TRUE VALUE Hardware</title>
      </Helmet>
      {/* About us section */}
      <h1>About Us</h1>
      <p>
        We are your locally-owned hardware store at BEST TRUE VALUE in LAKE
        CHARLES, LA, and we're delighted to be a part of the True Value family.
        Whether you are a professional or a beginner DIYer, we are committed to
        helping our community and offering professional guidance, tools,
        equipment, and the essential items to finish any home improvement
        project. Our experienced and welcoming staff is ready to assist you and
        make sure that your time at BEST TRUE VALUE is enjoyable.
      </p>
      <p>
        Please be aware that BEST TRUE VALUE is independently owned and run, and
        as a result, prices and program participation are liable to change at
        any time without prior notice.
      </p>
      <p>
        Please do not hesitate to contact us if you have any inquiries or needs.
        You can reach us by phoning <strong>(337) 240 8312</strong> during
        business hours or by sending an email to{' '}
        <strong>besttruevalue@gmail.com</strong>. We are eager to assist you
        soon!
      </p>

      {/* Call Us Now / Email section */}
      <h2>Get in Touch</h2>

      {/* Phone number section with phone icon */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faPhone} />
        <p
          style={{
            marginLeft: '10px',
            marginTop: '15px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
            transition: 'color 0.2s ease-in-out',
          }}
          onClick={handleCall}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'red')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '')}
        >
          (337) 240 8312
        </p>
      </div>

      {/* Phone number section with phone icon */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faEnvelope} />
        <p
          style={{
            marginLeft: '10px',
            marginTop: '15px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
            transition: 'color 0.2s ease-in-out',
          }}
          onClick={handleEmail}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'red')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '')}
        >
          besttruevalue@gmail.com
        </p>
      </div>
      <br />

      {/* Store Location section */}
      <h2>Store Location</h2>
      <p>1312 N MARTIN LUTHER KING HWY | Lake Charles | Louisiana | USA</p>
      <br />

      {/* Hours of Operation section */}
      <h2>Hours of Operation</h2>
      <HoursOfOperation />
    </div>
  );
};

export default AboutPage;
