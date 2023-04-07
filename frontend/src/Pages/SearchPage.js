import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { getErrorMessage } from '../utils';
import Rating from '../Components/Rating';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import Product from '../Components/Product';
import Pagination from '../Components/Pagination';

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
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const prices = [
  {
    name: '$1 - $50',
    value: '1 - 50',
  },
  {
    name: '$51 - $100',
    value: '51 - 100',
  },
  {
    name: '$101 - $200',
    value: '101 - 200',
  },
  {
    name: '$201 - $500',
    value: '201 - 500',
  },
  {
    name: '$501 - $1000',
    value: '501 - 1000',
  },
];

export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const department = sp.get('department') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, products, countProducts }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [department, order, page, price, query, rating]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&department=${department}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FAILURE',
          payload: getErrorMessage(error),
        });
      }
    };
    fetchData();
  }, [department, error, order, page, price, query, rating]);

  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await axios.get(`/api/products/departments`);
        setDepartments(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };
    fetchDepartments();
  }, [dispatch]);

  const getFilterUrl = (filter, skipPathname) => {
    const filterPage = filter.page || page;
    const filterDepartment = filter.department || department;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    return `${
      skipPathname ? '' : '/search?'
    }department=${filterDepartment}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };
  return (
    <div>
      <Helmet>
        <title>Search</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h4>Department</h4>
          <div>
            <ul>
              <li>
                <Link
                  className={`remove-link-style ${
                    'all' === department ? 'text-bold' : ''
                  }`}
                  to={getFilterUrl({ department: 'all' })}
                >
                  ALL
                </Link>
              </li>
              {departments.map((c) => (
                <li key={c}>
                  <Link
                    className={`remove-link-style ${
                      c === department ? 'text-bold' : ''
                    }`}
                    to={getFilterUrl({ department: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <hr></hr>
          <div>
            <h4>Price</h4>
            <ul>
              <li>
                <Link
                  className={`remove-link-style ${
                    'all' === price ? 'text-bold' : ''
                  }`}
                  to={getFilterUrl({ price: 'all' })}
                >
                  ALL
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={`remove-link-style ${
                      p.value === price ? 'text-bold' : ''
                    }`}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <hr></hr>
          <div>
            <h4>Customer Review</h4>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={`remove-link-style ${
                      `${r.rating}` === `${rating}` ? 'text-bold' : ''
                    }`}
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={`remove-link-style ${
                    rating === 'all' ? 'text-bold' : ''
                  }`}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
          <hr></hr>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingSpinner></LoadingSpinner>
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={9}>
                  <div style={{ color: '#bb0000' }}>
                    {countProducts === 0 ? 'No' : countProducts} Results
                    {query !== 'all' && ' : ' + query}
                    {department !== 'all' && ' : ' + department}
                    {price !== 'all' && ' : Price ' + price}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    department !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                        }}
                        variant="primary"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    Sort by{' '}
                    <select
                      style={{ maxWidth: '200px', marginLeft: '5px' }}
                      value={order}
                      onChange={(e) => {
                        navigate(getFilterUrl({ order: e.target.value }));
                      }}
                      className="form-control custom-select"
                    >
                      <option value="lowest">Price: Low to High</option>
                      <option value="highest">Price: High to Low</option>
                      <option value="toprated">Customer Reviews</option>
                    </select>
                  </div>
                </Col>
              </Row>
              {products.length === 0 && (
                <Message variant="danger">
                  Sorry, there are no products based on your search.
                </Message>
              )}

              <Row>
                {products.map((product) => (
                  <Col xs={12} sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
      <Pagination
        totalPosts={countProducts}
        postsPerPage={9}
        setCurrentPage={(newPage) => navigate(getFilterUrl({ page: newPage }))}
        currentPage={Number(page)}
      />
    </div>
  );
}
