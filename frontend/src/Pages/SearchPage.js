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

const generatePrices = () => {
  const priceRanges = [
    { min: 1, max: 50 },
    { min: 51, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 500 },
    { min: 501, max: 1000 },
  ];

  return priceRanges.map((range) => ({
    name: `$${range.min} - $${range.max}`,
    value: `${range.min} - ${range.max}`,
  }));
};

const generateRatings = () => {
  const ratingValues = [4, 3, 2, 1];
  return ratingValues.map((rating) => ({
    name: `${rating}stars or more`,
    rating,
  }));
};

const prices = generatePrices();
export const ratings = generateRatings();

const initialState = {
  loading: true,
  error: '',
  products: [],
  page: 0,
  pages: 0,
  countProducts: 0,
};

const actionsMap = {
  REQUEST: (state) => ({ ...state, loading: true }),
  SUCCESS: (state, action) => ({
    ...state,
    products: action.payload.products,
    page: action.payload.page,
    pages: action.payload.pages,
    countProducts: action.payload.countProducts,
    loading: false,
  }),
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
};

const reducer = (state = initialState, action) => {
  const handler = actionsMap[action.type];
  return handler ? handler(state, action) : state;
};

const useSearchParams = (params) => {
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const result = {};
  params.forEach((param) => {
    if (param === 'page') {
      result[param] = parseInt(sp.get(param) || '1', 10);
    } else {
      result[param] = sp.get(param) || 'all';
    }
  });
  return result;
};

export default function SearchPage() {
  const navigate = useNavigate();
  const { department, query, price, rating, order, page } = useSearchParams([
    'department',
    'query',
    'price',
    'rating',
    'order',
    'page',
  ]);

  const [departments, setDepartments] = useState([]);

  const [{ loading, error, products, countProducts }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  );

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

    const fetchDepartments = async () => {
      try {
        const { data } = await axios.get(`/api/products/departments`);
        setDepartments(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    };

    window.scrollTo(0, 0);
    fetchData();
    if (!departments.length) fetchDepartments();
  }, [
    department,
    error,
    order,
    page,
    price,
    query,
    rating,
    dispatch,
    departments,
  ]);

  const getFilterUrl = (filter, skipPathname) => {
    const defaultFilters = {
      page: page,
      department: department,
      query: query,
      rating: rating,
      price: price,
      order: order,
    };

    const appliedFilters = {
      ...defaultFilters,
      ...filter,
    };

    const queryString = Object.keys(appliedFilters)
      .map((key) => `${key}=${appliedFilters[key]}`)
      .join('&');

    return `${skipPathname ? '' : '/search?'}${queryString}`;
  };

  const FilterListItem = ({
    filterType,
    filterValue,
    filterName,
    currentFilter,
  }) => (
    <li>
      <Link
        className={`remove-link-style ${
          filterValue === currentFilter ? 'text-bold' : ''
        }`}
        to={getFilterUrl({ [filterType]: filterValue })}
      >
        {filterName}
      </Link>
    </li>
  );

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
              <FilterListItem
                filterType="department"
                filterValue="all"
                filterName="ALL"
                currentFilter={department}
              />
              {departments.map((c) => (
                <FilterListItem
                  filterType="department"
                  filterValue={c}
                  filterName={c}
                  currentFilter={department}
                  key={c}
                />
              ))}
            </ul>
          </div>
          <hr />
          <div>
            <h4>Price</h4>
            <ul>
              <FilterListItem
                filterType="price"
                filterValue="all"
                filterName="ALL"
                currentFilter={price}
              />
              {prices.map((p) => (
                <FilterListItem
                  filterType="price"
                  filterValue={p.value}
                  filterName={p.name}
                  currentFilter={price}
                  key={p.value}
                />
              ))}
            </ul>
          </div>
          <hr />
          <div>
            <h4>Customer Review</h4>
            <ul>
              {ratings.map((r) => (
                <FilterListItem
                  filterType="rating"
                  filterValue={r.rating}
                  filterName={<Rating caption={' or more'} rating={r.rating} />}
                  currentFilter={rating}
                  key={r.name}
                />
              ))}
              <FilterListItem
                filterType="rating"
                filterValue="all"
                filterName={<Rating caption={' or more'} rating={0} />}
                currentFilter={rating}
              />
            </ul>
          </div>
          <hr />
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
                    {query !== 'all' && ' > ' + query}
                    {department !== 'all' && ' > ' + department}
                    {price !== 'all' && ' > Price ' + price}
                    {rating !== 'all' &&
                      ' > Rating ' + rating + ' stars or more'}
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
                      <option value="newest">Default</option>
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
