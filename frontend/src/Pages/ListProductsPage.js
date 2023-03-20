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

// Reducer function declarations
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

const reducer = (state, action) =>
  actionsMap[action.type] ? actionsMap[action.type](state, action) : state;

ReactModal.setAppElement('#root');

export default function ListProductsPage() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleFetchSuccess = (data) => {
    dispatch({ type: 'SUCCESS', payload: data });
    setCountProducts(data.count);
  };

  const handleFetchError = (error) => {
    dispatch({ type: 'FAILURE', payload: error.message });
  };

  const setCurrentPageAndUpdateUrl = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`${location.pathname}?page=${pageNumber}`, { replace: true });
  };

  const onEdit = (productId) => {
    navigate(`/admin/product/${productId}`, { state: { currentPage } });
  };

  const createProduct = () => {
    dispatch({ type: 'CREATE_REQUEST' });

    axios
      .post(
        '/api/products',
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      )
      .then(({ data }) => {
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      })
      .catch((error) => {
        dispatch({ type: 'CREATE_FAILURE' });
        toast.error(getErrorMessage(error));
      });
  };

  const handleCreateProduct = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCreateProduct = () => {
    createProduct();
    setShowConfirmModal(false);
  };

  const handleCancelCreateProduct = () => {
    setShowConfirmModal(false);
  };

  const handleShowDeleteConfirmModal = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirmModal(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleProductDelete = async () => {
    try {
      await axios.delete(`/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success('Delete Successful');
      dispatch({ type: 'DELETE_SUCCESS' });
      setShowDeleteConfirmModal(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch({
        type: 'DELETE_FAILURE',
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const parsed = queryString.parse(location.search);
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
      <Row className="mb-3">
        <Col className="text-end">
          <div>
            <Button
              className="mb-3"
              variant="primary"
              type="button"
              onClick={handleCreateProduct}
            >
              CREATE A NEW PRODUCT
            </Button>

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
