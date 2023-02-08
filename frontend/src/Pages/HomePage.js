import { useState, useEffect } from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Product from "../Components/Product";
import Slider from "../Components/Slider";
import { Helmet } from "react-helmet-async";
import LoadingComponent from "../Components/LoadingComponent";
import MessageComponent from "../Components/MessageComponent";
import Pagination from "../Components/Pagination";

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await axios.get("/api/products");
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

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = products.slice(firstPostIndex, lastPostIndex);

  return (
    <div>
      <Helmet>
        <title>Best True Value Hardware</title>
      </Helmet>
      <div>
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
            {currentPosts.map((product) => (
              <Col key={product.slug} sm={12} md={6} lg={3} className="mb-3">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
        <Pagination
          totalPosts={products.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}

export default HomePage;
