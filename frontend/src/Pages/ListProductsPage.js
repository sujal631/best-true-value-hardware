// Importing packages and components
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Store } from '../Store.js';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import AdminPagination from '../Components/AdminPagination.js';
import { Col, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactModal from 'react-modal';
import ProductRow from '../Components/ProductRow';
import queryString from 'query-string';
import { Form, InputGroup } from 'react-bootstrap';
import { BiSearch } from 'react-icons/bi';

// Initialize the initial state of the component
const initialState = {
  loading: true,
  error: '',
  products: [],
  page: 0,
  pages: 0,
  loadingCreate: false,
  loadingDelete: false,
  successDelete: false,
};

// Define a map of reducer functions for each possible action
const actionsMap = {
  REQUEST: (state) => ({ ...state, loading: true }),
  SUCCESS: (state, { payload: { products, page, pages } }) => ({
    ...state,
    products,
    page,
    pages,
    loading: false,
  }),
  FAILURE: (state, { payload }) => ({
    ...state,
    loading: false,
    error: payload,
  }),
  CREATE_REQUEST: (state) => ({ ...state, loadingCreate: true }),
  CREATE_SUCCESS: (state) => ({ ...state, loadingCreate: false }),
  CREATE_FAILURE: (state) => ({ ...state, loadingCreate: false }),
  DELETE_REQUEST: (state) => ({
    ...state,
    loadingDelete: true,
    successDelete: false,
  }),
  DELETE_SUCCESS: (state) => ({
    ...state,
    loadingDelete: false,
    successDelete: true,
  }),
  DELETE_FAILURE: (state) => ({
    ...state,
    loadingDelete: false,
    successDelete: false,
  }),
  RESET: (state) => ({ ...state, loadingDelete: false, successDelete: false }),
};

// Define the reducer function using the initial state and the actions map
const reducer = (state = initialState, action) =>
  actionsMap[action.type] ? actionsMap[action.type](state, action) : state;

// Set the application element for ReactModal
ReactModal.setAppElement('#root');

export default function ListProductsPage() {
  // Define the state variables and the dispatch function
  const [
    {
      loading,
      loadingCreate,
      loadingDelete,
      error,
      products,
      pages,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  // Use hooks to access the current navigation state and location state
  const navigate = useNavigate();
  const location = useLocation();
  // Access the user info from the Store context
  const {
    state: { userInfo },
  } = useContext(Store);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [countProducts, setCountProducts] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  //Function to fetch Products
  const fetchProducts = (page, limit, search, filter, token) => {
    let url = `/api/products/admin?page=${page}&limit=${limit}`;

    if (search) {
      url += `&search=${search}`;
    }

    if (filter) {
      url += `&filter=${filter}`;
    }

    return axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Function to handle changes in the search bar
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Function to handle changes in the filter
  const handleFilter = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  // Function to handle a successful response from fetchProducts
  const handleFetchSuccess = (data) => {
    dispatch({ type: 'SUCCESS', payload: data });
    setCountProducts(data.count);
  };

  // Function to handle an error response from fetchProducts
  const handleFetchError = (error) => {
    dispatch({ type: 'FAILURE', payload: error.message });
  };

  // Function to set the current page and update the URL accordingly
  const setCurrentPageAndUpdateUrl = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`${location.pathname}?page=${pageNumber}`, { replace: true });
  };

  // Function to navigate to the Edit Product page
  const onEdit = (productId) => {
    navigate(`/admin/product/${productId}`, { state: { currentPage } });
  };

  // Function to create a new product
  const createProduct = () => {
    dispatch({ type: 'CREATE_REQUEST' });

    axios
      .post('/api/products', null, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      })
      .then(({ data }) => {
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      })
      .catch((error) => {
        dispatch({ type: 'CREATE_FAILURE' });
        toast.error(getErrorMessage(error));
      });
  };

  // Function to handle the "Create Product" button click
  const handleCreateProduct = () => {
    setShowConfirmModal(true);
  };

  // Function to handle the confirmation of creating a new product
  const handleConfirmCreateProduct = () => {
    createProduct();
    setShowConfirmModal(false);
  };

  // Function to handle canceling the creation of a new product
  const handleCancelCreateProduct = () => {
    setShowConfirmModal(false);
  };

  // Function to handle showing the delete confirmation modal
  const handleShowDeleteConfirmModal = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirmModal(true);
  };

  // Function to handle closing the delete confirmation modal
  const handleCloseDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
  };

  // Function to handle deleting a product
  const handleProductDelete = () => {
    axios
      .delete(`/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      })
      .then(() => {
        toast.success('Delete Successful');
        dispatch({ type: 'DELETE_SUCCESS' });
        setShowDeleteConfirmModal(false);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        dispatch({ type: 'DELETE_FAILURE' });
      });
  };

  // useEffect hook to fetch the list of products
  useEffect(() => {
    // Scrolls the window to the top of the page
    window.scrollTo(0, 0);
    // Parses the page number from the URL and sets the current page accordingly
    const parsed = queryString.parse(location.search);
    // If the current page is not equal to the page from the URL, sets the current page to the page from the URL
    const pageFromUrl = parsed.page ? parseInt(parsed.page, 10) : 1;
    const pageFromState = location.state?.currentPage || pageFromUrl;

    const fetchData = async () => {
      try {
        const { data } = await fetchProducts(
          currentPage,
          pageSize,
          search,
          filter,
          userInfo.token
        );

        handleFetchSuccess(data);
      } catch (error) {
        handleFetchError(error);
      }
    };

    if (currentPage !== pageFromState) {
      setCurrentPage(pageFromState);
    } else {
      fetchData();
    }

    // If a successful delete has occurred, dispatch 'RESET' action and fetch the products again
    if (successDelete) {
      dispatch({ type: 'RESET' });
      fetchData();
    }
  }, [currentPage, location, userInfo, successDelete, search, filter]);

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '200px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
  };

  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>List Products</title>
      </Helmet>

      {/* Displaying the page header */}
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
      </Row>
      {/* Create a new product button and modals for confirmation */}
      <Row className="mb-3">
        <Col className="text-end">
          <div>
            {/* Button to create a new product */}
            <Button
              className="mb-3"
              variant="primary"
              type="button"
              onClick={handleCreateProduct}
            >
              CREATE A NEW PRODUCT
            </Button>

            {/* Modal to confirm the creation of a new product */}
            <ReactModal
              isOpen={showConfirmModal}
              onRequestClose={handleCancelCreateProduct}
              style={customStyles}
            >
              <strong>
                <p>Confirm Create New Product</p>
              </strong>
              <p>Are you sure you would like to create a new product?</p>
              <div className="d-flex justify-content-around mt-3">
                <Button variant="warning" onClick={handleConfirmCreateProduct}>
                  CONFIRM
                </Button>
                <Button variant="primary" onClick={handleCancelCreateProduct}>
                  Cancel
                </Button>
              </div>
            </ReactModal>

            {/* Modal to confirm the deletion of a product */}
            <ReactModal
              isOpen={showDeleteConfirmModal}
              onRequestClose={handleCloseDeleteConfirmModal}
              style={customStyles}
            >
              <strong>
                <p>Confirm Delete Product</p>
              </strong>
              <p>Are you sure you want to delete this product?</p>
              <div className="d-flex justify-content-around mt-3">
                <Button variant="warning" onClick={handleProductDelete}>
                  CONFIRM
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCloseDeleteConfirmModal}
                >
                  Cancel
                </Button>
              </div>
            </ReactModal>
          </div>
        </Col>
      </Row>
      {/* Search and filter options */}
      <Row>
        <Col md={4} className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Product's name ..."
              value={search}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
        <Col md={3} className="mb-3">
          <select
            value={filter}
            onChange={handleFilter}
            className="form-control custom-select"
          >
            <option value="">Filter by Department</option>
            <option value="Lawn and Garden">Lawn and Garden</option>
            <option value="Lighting">Lighting</option>
            <option value="Outdoor and Patio">Outdoor and Patio</option>
            <option value="Paint">Paint</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Tools">Tools</option>
          </select>
        </Col>
      </Row>

      {/* Conditionally render loading spinner, error message, or product list and pagination */}
      {(() => {
        if (loadingCreate) {
          return <LoadingSpinner />;
        }
        if (loadingDelete) {
          return <LoadingSpinner />;
        }
        if (loading) {
          return <LoadingSpinner />;
        }
        if (error) {
          return <Message variant="danger">{error}</Message>;
        }
        return (
          <>
            <ProductRow
              products={products}
              onEdit={onEdit}
              onDelete={handleShowDeleteConfirmModal}
            />
            <div>
              {/* Pagination Component */}
              <AdminPagination
                totalPages={pages}
                setCurrentPage={setCurrentPageAndUpdateUrl}
                currentPage={currentPage}
              />
            </div>
          </>
        );
      })()}
    </div>
  );
}
