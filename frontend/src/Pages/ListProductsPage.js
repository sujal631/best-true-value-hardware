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

const actionsMap = {
  REQUEST: (state) => ({ ...state, loading: true }),
  SUCCESS: (state, action) => ({
    ...state,
    products: action.payload.products,
    page: action.payload.page,
    pages: action.payload.pages,
    loading: false,
  }),
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
  CREATE_REQUEST: (state) => ({ ...state, loadingCreate: true }),
  CREATE_SUCCESS: (state) => ({ ...state, loadingCreate: false }),
  CREATE_FAILURE: (state) => ({ ...state, loadingCreate: false }),
};

const reducer = (state, action) => {
  const handler = actionsMap[action.type];
  return handler ? handler(state, action) : state;
};

ReactModal.setAppElement('#root');

export default function ListProductsPage() {
  const [{ loading, error, products, pages, loadingCreate }, dispatch] =
    useReducer(reducer, {
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

  const fetchProducts = (page, limit, token) => {
    return axios.get(`/api/products/admin?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleFetchSuccess = (data) => {
    dispatch({ type: 'SUCCESS', payload: data });
    setCountProducts(data.count);
  };

  const handleFetchError = (error) => {
    dispatch({ type: 'FAILURE', payload: error.message });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const parsed = queryString.parse(location.search);
    const pageFromUrl = parsed.page ? parseInt(parsed.page, 10) : 1;
    const pageFromState = location.state?.currentPage || pageFromUrl;

    if (currentPage !== pageFromState) {
      setCurrentPage(pageFromState);
    } else {
      fetchProducts(currentPage, pageSize, userInfo.token)
        .then(({ data }) => handleFetchSuccess(data))
        .catch(handleFetchError);
    }
  }, [currentPage, location, userInfo]);

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
        toast.success('Product created successfully');
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
          </div>
        </Col>
      </Row>

      {(() => {
        if (loadingCreate) {
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
            <ProductRow products={products} onEdit={onEdit} />
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
