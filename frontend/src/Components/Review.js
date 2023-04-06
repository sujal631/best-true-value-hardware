import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Message from '../Components/MessageComponent';
import Rating from '../Components/Rating';
import axios from 'axios';

const ReviewComponent = ({ reviews, userInfo, productId, token }) => {
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [updatedReviews, setUpdatedReviews] = useState(reviews);

  useEffect(() => {
    const fetchLikesDislikes = async () => {
      const response = await axios.get('/api/products/likes-dislikes');
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
    };

    fetchLikesDislikes();
  }, []);

  const handleLike = async (event, reviewId) => {
    event.preventDefault();

    const response = await axios.put(
      `/api/products/${productId}/reviews/${reviewId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setLikes({ ...likes, [reviewId]: response.data.updatedLikes.length });
    setDislikes({
      ...dislikes,
      [reviewId]: response.data.updatedDislikes.length,
    });
    setUpdatedReviews(
      updatedReviews.map((review) =>
        review._id === reviewId
          ? {
              ...review,
              likes: response.data.updatedLikes,
              dislikes: response.data.updatedDislikes,
            }
          : review
      )
    );
  };

  const handleDislike = async (event, reviewId) => {
    event.preventDefault();

    const response = await axios.put(
      `/api/products/${productId}/reviews/${reviewId}/dislike`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setLikes({ ...likes, [reviewId]: response.data.updatedLikes.length });
    setDislikes({
      ...dislikes,
      [reviewId]: response.data.updatedDislikes.length,
    });
    setUpdatedReviews(
      updatedReviews.map((review) =>
        review._id === reviewId
          ? {
              ...review,
              likes: response.data.updatedLikes,
              dislikes: response.data.updatedDislikes,
            }
          : review
      )
    );
  };

  return (
    <div>
      {reviews.length === 0 && (
        <Message variant="warning">
          No reviews yet. Be the first to review?
        </Message>
      )}
      <ListGroup className="mb-3">
        {updatedReviews
          .sort((a, b) => {
            // Show the logged-in user's review at the top
            if (userInfo && a.user === userInfo._id) return -1;
            if (userInfo && b.user === userInfo._id) return 1;
            // Sort the remaining reviews by creation date
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .map((review) => {
            // Check if the current user is the author of the review
            const isAuthor =
              userInfo && review && review.user && userInfo._id === review.user;
            const userLiked = userInfo && review.likes.includes(userInfo._id);
            const userDisliked =
              userInfo && review.dislikes.includes(userInfo._id);

            return (
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
                <p style={{ fontSize: '12px', margin: '0' }}>
                  Reviewed on {review.createdAt.substring(0, 10)}
                </p>
                <p style={{ fontSize: '14px' }}>{review.comment}</p>
                <div
                  className="mb-3"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}
                >
                  <p
                    style={{
                      marginRight: '20px',
                      marginBottom: 0,
                      fontSize: '14px',
                      color: isAuthor ? '#bfbfbf' : 'inherit',
                    }}
                  >
                    <strong>Did you find this review helpful?</strong>
                  </p>
                  <button
                    type="button"
                    onClick={(event) => handleLike(event, review._id)}
                    disabled={isAuthor}
                    style={{
                      marginRight: '5px',
                      border: '1px solid',
                      borderRadius: '8px',
                      color: isAuthor
                        ? '#bfbfbf'
                        : userLiked
                        ? '#00b300'
                        : 'inherit',
                    }}
                  >
                    <i className="fas fa-thumbs-up"></i>{' '}
                    {likes[review._id] || 0}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => handleDislike(event, review._id)}
                    disabled={isAuthor}
                    style={{
                      marginLeft: '5px',
                      border: '1px solid',
                      borderRadius: '8px',
                      color: isAuthor
                        ? '#bfbfbf'
                        : userDisliked
                        ? '#bb0000'
                        : 'inherit',
                    }}
                  >
                    <i className="fas fa-thumbs-down"></i>{' '}
                    {dislikes[review._id] || 0}
                  </button>
                </div>
              </ListGroup.Item>
            );
          })}
      </ListGroup>
    </div>
  );
};

export default ReviewComponent;
