function Rating({ rating, numReviews }) {
  const stars = [1, 2, 3, 4, 5].map((star, index) => (
    <span key={`${star}-${index}`}>
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
  ));
  return (
    <div className="rating">
      {stars}
      <span> {numReviews}</span>
    </div>
  );
}

export default Rating;
