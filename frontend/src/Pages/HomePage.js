import { useState, useEffect } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../Components/Product';
import Slider from '../Components/Slider';
import { Helmet } from 'react-helmet-async';
import LoadingComponent from '../Components/LoadingComponent';
import MessageComponent from '../Components/MessageComponent';

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await axios.get('/api/products');
        /* const sorted = result.data
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);
        setProducts(sorted); */

        setProducts(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Best True Value Hardware</title>
      </Helmet>
      <div className="slider">
        <Slider />
      </div>

      <h1>Sample Products</h1>
      <div className="product-container">
        {loading ? (
          <LoadingComponent />
        ) : error ? (
          <MessageComponent variant="danger">{error}</MessageComponent>
        ) : (
          <Row>
            {products.map((product) => (
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

export default HomePage;
