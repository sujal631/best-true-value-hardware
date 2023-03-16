import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Store } from '../Store.js';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import AdminPagination from '../Components/AdminPagination.js';
const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function ListProductsPage() {
  const [{ loading, error, products, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [countProducts, setCountProducts] = useState(0);

  const pageSize = 10;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/products/admin?page=${currentPage}&limit=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        dispatch({ type: 'SUCCESS', payload: data });
        setCountProducts(data.count);
      } catch (error) {
        dispatch({ type: 'FAILURE', payload: error.message });
      }
    };

    fetchData();
  }, [currentPage, userInfo]);

  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>List Products</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Products</h1>
      {loading ? (
        <LoadingSpinner></LoadingSpinner>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>PRODUCT ID</th>
                <th>PRODUCT NAME</th>
                <th>AMOUNT</th>
                <th>DEPARTMENT</th>
                <th>BRAND</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.department}</td>
                  <td>{product.brand}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <AdminPagination
              totalPages={pages}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
