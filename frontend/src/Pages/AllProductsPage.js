import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingComponent from '../Components/LoadingComponent';
import MessageComponent from '../Components/MessageComponent';
import Product from '../Components/Product';

export default function AllProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await axios.get('/api/products');
        setProducts(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts =
    selectedCategory === ''
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div>
      <Helmet>
        <title>Products</title>
      </Helmet>

      <div className="product-container">
        <div className="mb-3">
          <select
            className="form-control"
            value={selectedCategory}
            onChange={(event) => handleCategoryChange(event.target.value)}
          >
            <option value="">All Categories</option>
            {products
              .reduce(
                (uniqueCategories, product) =>
                  uniqueCategories.includes(product.category)
                    ? uniqueCategories
                    : [...uniqueCategories, product.category],
                []
              )
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        {loading ? (
          <LoadingComponent />
        ) : error ? (
          <MessageComponent variant="danger">{error}</MessageComponent>
        ) : (
          <Row>
            {filteredProducts.map((product) => (
              <Col key={product.slug} sm={12} md={6} lg={3} className="mb-3">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
