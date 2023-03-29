// Importing necessary modules and components
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import Product from '../Components/Product';
import Pagination from '../Components/Pagination';

// AllDepartmentsPage component
export default function ProductsPage() {
  // State variables to manage loading status, error message, products, selected department, and all departments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [allDepartments, setAllDepartments] = useState([]);

  const [currentPage, setCurrentPage] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    const page = query.get('page');
    return page ? parseInt(page, 10) : 1;
  });
  const [postsPerPage] = useState(12);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // useEffect hook to fetch products data from the API and set state variables
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await axios.get('/api/products');
        setProducts(result.data);
        setAllDepartments(
          Array.from(new Set(result.data.map((item) => item.department)))
        );
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentPage);
    window.history.pushState({}, '', '?' + params.toString());
  }, [currentPage]);

  // Function to handle change in the selected department
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
  };

  // Filtered products based on the selected department
  const filteredProducts =
    selectedDepartment === ''
      ? products
      : products.filter((product) => product.department === selectedDepartment);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = filteredProducts.slice(firstPostIndex, lastPostIndex);

  return (
    <div>
      {/* Setting the page title */}
      <Helmet>
        <title>Products</title>
      </Helmet>

      {/* Container for products */}
      <div className="product-container">
        {/* Dropdown to select the department */}
        <div className="mb-3">
          <select
            className="all-departments-btn"
            value={selectedDepartment}
            onChange={(event) => handleDepartmentChange(event.target.value)}
          >
            <option value="">All Departments</option>
            {allDepartments.sort().map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        {/* Conditionally rendering loading spinner, error message, or product list */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <div className="products-row-container">
            <Row>
              {currentPosts.map((product) => (
                <Col key={product.slug} sm={12} md={6} lg={3} className="mb-3">
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          </div>
        )}
        <div className="pagination-container">
          {/* Render Pagination Component*/}
          <Pagination
            totalPosts={filteredProducts.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
