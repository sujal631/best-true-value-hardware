// Import React and the required UI components from react-bootstrap library
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';

const Product = ({ product }) => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCart = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, this product is out of stock');
      return;
    }
    ctxDispatch({ type: 'ADD_ITEM', payload: { ...item, quantity } });
  };

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
        {product.countInStock === 0 ? (
          <Button variant="primary" disabled>
            OUT OF STOCK
          </Button>
        ) : (
          <Button variant="primary" onClick={() => addToCart(product)}>
            ADD TO CART
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

//Export the product
export default Product;
