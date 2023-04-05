// Import necessary modules and dependencies
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Message from '../Components/MessageComponent';
import Rating from '../Components/Rating';

const ReviewComponent = ({ reviews, userInfo }) => {
  return (
    <div>
      {reviews.length === 0 && (
        <Message variant="warning">
          No reviews yet. Be the first to review?
        </Message>
      )}
      <ListGroup className="mb-3">
        {reviews.map((review) => (
          <ListGroup.Item key={review._id}>
            <i
              className="fas fa-user"
              style={{
                fontSize: '1.2rem',
                color: '#000',
                backgroundColor: '#c5c5c5',
                padding: '6px 7px',
                borderRadius: '16px',
              }}
            ></i>{' '}
            {review.name}
            <Rating
              rating={review.rating}
              caption=<span
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  margin: '10px',
                }}
              >
                Verified Purchase
              </span>
            ></Rating>
            <p style={{ margin: '0' }}>
              <strong>{review.title}</strong>
            </p>
            <p style={{ fontSize: '12px' }}>
              Reviewed on {review.createdAt.substring(0, 10)}
            </p>
            <p style={{ fontSize: '14px' }}>{review.comment}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ReviewComponent;
