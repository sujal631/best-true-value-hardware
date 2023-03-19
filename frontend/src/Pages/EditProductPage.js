import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { toast } from 'react-toastify';
import { Container, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const actionsMap = {
  REQUEST: (state) => ({ ...state, loading: true }),
  SUCCESS: (state) => ({ ...state, loading: false }),
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
  UPDATE_REQUEST: (state) => ({ ...state, loadingUpdate: true }),
  UPDATE_SUCCESS: (state) => ({ ...state, loadingUpdate: false }),
  UPDATE_FAILURE: (state) => ({ ...state, loadingUpdate: false }),
  UPLOAD_REQUEST: (state) => ({
    ...state,
    loadingUpload: true,
    errorUpload: '',
  }),
  UPLOAD_SUCCESS: (state) => ({
    ...state,
    loadingUpload: false,
    errorUpload: '',
  }),
  UPLOAD_FAILURE: (state, action) => ({
    ...state,
    loadingUpload: false,
    errorUpload: action.payload,
  }),
};

const reducer = (state, action) => {
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

const EditProductPage = () => {
  const { id: productId } = useParams();
  const {
    state: { userInfo },
  } = useContext(Store);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.state?.currentPage || 1;

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { loading, error, loadingUpdate, loadingUpload } = state;

  const [productData, setProductData] = useState({
    name: '',
    slug: '',
    image: '',
    brand: '',
    department: '',
    description: '',
    price: '',
    countInStock: '',
  });

  useEffect(() => {
    const fetchData = () => {
      dispatch({ type: 'REQUEST' });

      axios
        .get(`/api/products/${productId}`)
        .then((response) => {
          setProductData(response.data);
          dispatch({ type: 'SUCCESS' });
        })
        .catch((error) => {
          dispatch({
            type: 'FAILURE',
            payload: getErrorMessage(error),
          });
        });
    };

    fetchData();
  }, [productId]);

  const handleUploadImages = async (e) => {
    const imageFile = e.target.files[0];

    const uploadImage = async (file) => {
      const formData = new FormData();
      formData.append('image_file', file);

      try {
        const { data } = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        return data.secure_url;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    };

    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const uploadedImageUrl = await uploadImage(imageFile);
      dispatch({ type: 'UPLOAD_SUCCESS' });
      setProductData({ ...productData, image: uploadedImageUrl });
    } catch (error) {
      toast.error(error.message);
      dispatch({ type: 'UPLOAD_FAILURE', payload: error.message });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData({ ...productData, [name]: value });
  };

  const updateProduct = async (productId, productData, token) => {
    const response = await axios.put(
      `/api/products/${productId}`,
      {
        _id: productId,
        ...productData,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();

    const onUpdateSuccess = () => {
      toast.success('Update Successful');
      navigate('/admin/listProducts', { state: { currentPage: currentPage } });
    };

    const onUpdateFailure = () => {
      dispatch({ type: 'UPDATE_FAILURE' });
    };

    dispatch({ type: 'UPDATE_REQUEST' });

    updateProduct(productId, productData, userInfo.token)
      .then(() => {
        dispatch({ type: 'UPDATE_SUCCESS' });
        onUpdateSuccess();
      })
      .catch(onUpdateFailure);
  };

  const {
    name,
    slug,
    image,
    brand,
    department,
    description,
    price,
    countInStock,
  } = productData;

  return (
    <div>
      <Helmet>
        <title>Product {productId}</title>
      </Helmet>
      <Container className="container small-container">
        <h1>Product {productId}</h1>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={handleUpdateProduct}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="slug" className="form-label">
                Slug
              </label>
              <input
                type="text"
                className="form-control"
                id="slug"
                name="slug"
                value={slug}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Image
              </label>
              <input
                type="text"
                className="form-control"
                id="image"
                name="image"
                value={image}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="imageFile" className="form-label">
                Upload Image
              </label>
              <input
                type="file"
                className="form-control"
                id="imageFile"
                name="imageFile"
                onChange={handleUploadImages}
                required
              />
            </div>

            <div className="row">
              <div className=" col-md-6 mb-3">
                <label htmlFor="brand" className="form-label">
                  Brand
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="brand"
                  name="brand"
                  value={brand}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className=" col-md-6 mb-3">
                <label htmlFor="department" className="form-label">
                  Department
                </label>
                <input
                  type="text"
                  className="form-control "
                  id="department"
                  name="department"
                  value={department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="countInStock" className="form-label">
                  Count In Stock
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="countInStock"
                  name="countInStock"
                  value={countInStock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                required
                style={{ height: '150px', resize: 'vertical' }}
              />
            </div>
            <div className="d-grid gap-2 mb-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingUpdate}
              >
                UPDATE
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCancel}
              >
                CANCEL
              </button>
              {loadingUpdate && <LoadingSpinner />}
            </div>
          </Form>
        )}
      </Container>
    </div>
  );
};

export default EditProductPage;
