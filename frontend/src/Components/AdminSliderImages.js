//Import necessary modules
import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminSliderImages = () => {
  // Access the global state
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Hook for navigation
  const navigate = useNavigate();
  // State to keep track of the uploading status
  const [uploading, setUploading] = useState(false);

  // State for storing image files, image previews, and current slider image previews
  const [images, setImages] = useState(Array(5).fill(null));
  const [previews, setPreviews] = useState(Array(5).fill(null));
  const [currentPreviews, setCurrentPreviews] = useState(Array(5).fill(null));

  // Fetch current slider images and store their previews in the state
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await axios.get('/api/sliderImages');
        const imagesData = response.data;
        const previewArray = imagesData.map((image) => image.url);
        setCurrentPreviews(previewArray);
      } catch (error) {
        console.error('Error fetching slider images', error);
      }
    };

    fetchSliderImages();
  }, []);

  // Handle file input change, update image files and previews state
  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewArray = [...previews];
        previewArray[index] = reader.result;
        setPreviews(previewArray);
      };
      reader.readAsDataURL(file);

      const imagesArray = [...images];
      imagesArray[index] = file;
      setImages(imagesArray);
    }
  };

  // Handle image upload and update the server with new images
  const handleUpload = async () => {
    setUploading(true); // Set uploading state to true when the upload starts

    // Iterate over images array and upload each image
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      if (image) {
        const formData = new FormData();
        formData.append('image_file', image);
        try {
          const response = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userInfo.token}`,
            },
          });

          await axios.post('/api/sliderImages', {
            imageUrl: response.data.secure_url,
            publicId: response.data.public_id,
            index: index,
          });
        } catch (error) {
          toast.error(`Error uploading image ${index + 1}`);
        }
      }
    }
    navigate('/'); // Navigate to the home screen
    setUploading(false); // Set uploading state to false when the upload finishes
  };

  return (
    <Container className="container small-container">
      <h1>Slider Images</h1>
      <Row>
        {/* Render image input, current and new previews for each slider image */}
        {Array.from({ length: 5 }).map((_, index) => (
          <Col key={index} md={12}>
            <Form.Group>
              <Form.Label>Image {index + 1}</Form.Label>
              <br />
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, index)}
              />

              <div className="d-flex align-items-center my-3">
                {/* Render current slider image preview */}
                {currentPreviews[index] && (
                  <Image
                    src={currentPreviews[index]}
                    alt={`Current Slider Image ${index + 1}`}
                    thumbnail
                  />
                )}
                <span className="mx-3">
                  {' '}
                  <i
                    className="fas fa-arrow-right"
                    style={{ fontSize: '2rem' }}
                  ></i>{' '}
                </span>
                {/* Render new slider image preview */}
                {previews[index] && (
                  <Image
                    src={previews[index]}
                    alt={`New Slider Image ${index + 1}`}
                    thumbnail
                  />
                )}
              </div>
            </Form.Group>
          </Col>
        ))}
      </Row>
      <div className="d-grid gap-2 my-3">
        {/* Render upload button, disable it and show a loading message when uploading */}
        <Button variant="primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Please wait, Uploading…' : 'Upload Images'}
        </Button>
      </div>
    </Container>
  );
};

export default AdminSliderImages;
