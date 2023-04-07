import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Message from '../Components/MessageComponent';
import Rating from '../Components/Rating';
import axios from 'axios';
import ReactModal from 'react-modal';
import { Button } from 'react-bootstrap';

const ReviewComponent = ({ reviews, userInfo, productId, token }) => {
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [updatedReviews, setUpdatedReviews] = useState(reviews);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

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

  const handleOpenDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteReview = async () => {
    // Delete review using the reviewToDelete variable
    await axios.delete(`/api/products/${productId}/reviews/${reviewToDelete}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUpdatedReviews(updatedReviews.filter((r) => r._id !== reviewToDelete));
    handleCloseDeleteModal();
    refreshPage();
  };
  const toggleExpandedComment = (reviewId) => {
    setExpandedComments({
      ...expandedComments,
      [reviewId]: !expandedComments[reviewId],
    });
  };

  const renderComment = (comment, limit) => {
    const lines = comment.split('\n');
    if (lines.length <= 7 && comment.length <= limit) {
      return lines.map((line, index) => (
        <span key={index}>
          {line}
          {index !== lines.length - 1 && <br />}
        </span>
      ));
    }

    let result = '';
    let currentLength = 0;
    let lineCount = 0;

    for (let line of lines) {
      if (lineCount >= 7) break;
      if (currentLength + line.length + 1 > limit) {
        result += line.slice(0, limit - currentLength) + '...';
        break;
      }
      result += line + '\n';
      currentLength += line.length + 1;
      lineCount++;
    }

    const trimmedResult = result.slice(0, -1);

    const resultLines = trimmedResult.split('\n');
    const jsxResult = resultLines.map((line, index) => (
      <span key={index}>
        {line}
        {index !== resultLines.length - 1 && <br />}
      </span>
    ));

    return jsxResult;
  };

  const refreshPage = () => {
    window.location.reload();
    window.scrollTo(0, 0);
  };

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '200px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
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
                <p style={{ fontSize: '14px' }}>
                  {expandedComments[review._id] ||
                  (review.comment.length <= 500 &&
                    review.comment.split('\n').length <= 7)
                    ? review.comment.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index !== review.comment.split('\n').length - 1 && (
                            <br />
                          )}
                        </span>
                      ))
                    : renderComment(review.comment, 500)}
                  {(review.comment.length > 500 ||
                    review.comment.split('\n').length > 7) && (
                    <span>
                      <button
                        className="btn btn-outline-dark btn-text "
                        onClick={() => toggleExpandedComment(review._id)}
                        style={{
                          marginLeft: '5px',
                          border: '1px solid',
                          borderRadius: '8px',
                          padding: '2px 5px',
                          fontSize: '12px',
                        }}
                      >
                        {expandedComments[review._id]
                          ? 'Show less'
                          : 'Show more'}
                      </button>
                    </span>
                  )}
                </p>
                <div
                  className="mb-3"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                  }}
                >
                  {isAuthor && (
                    <button
                      variant="light"
                      className="btn btn-outline-danger btn-text "
                      type="button"
                      style={{
                        marginRight: '20px',
                        border: '1px solid',
                        borderRadius: '8px',
                        padding: '2px 5px',
                      }}
                      onClick={() => handleOpenDeleteModal(review._id)}
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p
                      style={{
                        marginRight: '20px',
                        marginBottom: 0,
                        fontSize: '14px',
                        color: isAuthor || !token ? '#bfbfbf' : 'inherit',
                      }}
                    >
                      <strong>Did you find this review helpful?</strong>
                    </p>
                    <button
                      type="button"
                      onClick={(event) => handleLike(event, review._id)}
                      disabled={isAuthor || !token}
                      style={{
                        marginRight: '5px',
                        border: '1px solid',
                        borderRadius: '8px',
                        color:
                          isAuthor || !token
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
                      disabled={isAuthor || !token}
                      style={{
                        marginLeft: '5px',
                        border: '1px solid',
                        borderRadius: '8px',
                        color:
                          isAuthor || !token
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
                </div>
              </ListGroup.Item>
            );
          })}
      </ListGroup>
      <ReactModal
        isOpen={showDeleteModal}
        onRequestClose={handleCloseDeleteModal}
        style={customStyles}
      >
        <strong>
          <p>Confirm Delete Review</p>
        </strong>
        <p>Are you sure you would like to delete this review?</p>
        <div className="d-flex justify-content-around mt-3">
          <Button variant="warning" onClick={handleDeleteReview}>
            CONFIRM
          </Button>
          <Button variant="primary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
        </div>
      </ReactModal>
    </div>
  );
};

export default ReviewComponent;
