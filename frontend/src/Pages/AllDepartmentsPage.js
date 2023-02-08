// Importing necessary modules and components
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import Product from '../Components/Product';

// AllDepartmentsPage component
export default function AllDepartmentsPage() {
  // State variables to manage loading status, error message, products, selected department, and all departments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [allDepartments, setAllDepartments] = useState([]);

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

  // Function to handle change in the selected department
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
  };

  // Filtered products based on the selected department
  const filteredProducts =
    selectedDepartment === ''
      ? products
      : products.filter((product) => product.department === selectedDepartment);

  return (
    <div>
      {/* Setting the page title */}
      <Helmet>
        <title>All Departments</title>
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
            {allDepartments.map((department) => (
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
