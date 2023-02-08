//Import required modules
import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

/*
Message component that displays a Bootstrap Alert with the given variant and message children.
The default variant is "info".
*/
const Message = ({ variant = 'info', children }) => {
  return (
    <Alert variant={variant}>
      <p>{children}</p>
    </Alert>
  );
};

/* PropTypes for the Message component */
Message.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  children: PropTypes.node.isRequired,
};

//Export the Message
export default Message;
