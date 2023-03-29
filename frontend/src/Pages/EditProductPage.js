// Importing necessary dependencies and components
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

// Define the default state of the reducer
const initialState = {
  loading: false,
  error: '',
  loadingUpdate: false,
  loadingUpload: false,
  errorUpload: '',
};

// Creating an object to map different actions
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

// Creating a reducer that will update the state based on the actions
const reducer = (state, action) => {
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

// EditProductPage functional component
const EditProductPage = () => {
  // Extracting productId from the URL parameters
  const { id: productId } = useParams();
  // Extracting userInfo from Store context
  const {
    state: { userInfo },
  } = useContext(Store);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.state?.currentPage || 1;

  const [state, dispatch] = useReducer(reducer, initialState);

  const { loading, error, loadingUpdate, loadingUpload } = state;

  // Initializing productData state object with some default values
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
    // Define a function to fetch product data
    const fetchData = () => {
      dispatch({ type: 'REQUEST' });

      // Make an API request to fetch product details using the productId
      axios
        .get(`/api/products/${productId}`)
        .then((response) => {
          // Update the product data state with the fetched data
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

    // Call the fetchData function to fetch the product data
    fetchData();
  }, [productId]);

  // Function to handle image uploads
  const handleUploadImages = async (e) => {
    // Get the selected image file
    const imageFile = e.target.files[0];

    // Define a function to upload the image file to the server
    const uploadImage = async (file) => {
      const apiUrl = '/api/upload';
      const headers = {
        'Content-Type': 'multipart/form-data',
        authorization: `Bearer ${userInfo.token}`,
      };
      const formData = new FormData();
      formData.append('image_file', file);

      try {
        const { data } = await axios.post(apiUrl, formData, {
          headers,
        });
        return data.secure_url;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    };

    // Attempt to upload the image and update the product data state with the uploaded image URL
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

  // Function to handle changes in form input fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData({ ...productData, [name]: value });
  };

  // Function to update the product data on the server
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

  // Function to handle cancel button clicks and navigate back to the previous
  const handleCancel = () => {
    navigate(-1);
  };

  // Function to handle form submissions for updating product data
  const handleUpdateProduct = (e) => {
    e.preventDefault();

    // Functions to handle success and failure of product updates
    const onUpdateSuccess = () => {
      toast.success('Update Successful');
      navigate('/admin/listProducts', { state: { currentPage: currentPage } });
    };

    const onUpdateFailure = () => {
      dispatch({ type: 'UPDATE_FAILURE' });
    };

    // Dispatch an 'UPDATE_REQUEST' action and attempt to update the product on the server
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
      {/* Set the page title using Helmet */}
      <Helmet>
        <title>Product {productId}</title>
      </Helmet>
      <Container className="container small-container">
        <h1>Product {productId}</h1>

        {loading ? (
          <LoadingSpinner /> // Display a loading spinner or an error message if necessary
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          // Render the form for updating product information
          <Form onSubmit={handleUpdateProduct}>
            {/* Render input fields for product name, slug, image, brand, department, price, and count in stock */}
            {/* Each input field has an onChange event handler to update the product data state */}
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

            {/* Render a file input field for uploading an image and the onChange event handler to handle image uploads */}
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
              {/* Render a textarea for product description input field */}
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

            {/* Render buttons for submitting the form and canceling the edit */}
            <div className="d-grid gap-2 mb-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingUpdate}
              >
                UPDATE
              </button>

              {/* The cancel button has an onClick event handler to navigate back to the previous page */}
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
