import React from 'react';

// Function component for displaying the rating of a product
const Rating = ({ rating, numReviews, caption }) => {
  // Map over the range of 1 to 5 to display the stars for the rating
  const stars = Array.from({ length: 5 }, (_, i) => i + 1).map(
    (star, index) => (
      <span key={`${star}-${index}`}>
        {/* Check if the rating is greater than or equal to the current star, then render a filled star.
If not, check if the rating is greater than or equal to the current star minus 0.5, then render a half-filled star.
Otherwise, render an empty star. */}
        <i
          className={
            rating >= star
              ? 'fas fa-star'
              : rating >= star - 0.5
              ? 'fas fa-star-half-alt'
              : 'far fa-star'
          }
        ></i>
      </span>
    )
  );

  // Return the stars and the number of reviews
  return (
    <div className="rating">
      {stars}
      {caption ? (
        <span>{caption}</span>
      ) : (
        <span>{' ' + numReviews + ' reviews'}</span>
      )}
    </div>
  );
};

export default Rating;
