// Import React and the required UI components from react-bootstrap library
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card>
      {/* Link to the product details page with the specific product's slug */}
      <Link to={`/product/${product.slug}`}>
        <Image
          src={product.image}
          className="card-img-top"
          alt={product.name}
        />
      </Link>
      <Card.Body>
        {/* Link to the product details page with the specific product's slug, with a class to remove default link styles */}
        <Link to={`/product/${product.slug}`} className="remove-link-style">
          {/* Display the product's name */}
          <Card.Title>{product.name}</Card.Title>
        </Link>

        {/* Import and display the rating component with the current product's rating and number of reviews(hardcoded) */}
        <Rating rating={product.rating} numReviews={product.numReviews} />

        {/* Display the product's price */}
        <Card.Text>${product.price}</Card.Text>

        {/* Add to cart button */}
        <Button variant="primary">Add to cart</Button>
      </Card.Body>
    </Card>
  );
};

//Export the product
export default Product;
