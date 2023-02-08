// Import React and the required UI components from react-bootstrap library
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';

//Importing Loading Component and Message Component
import LoadingComponent from './LoadingComponent';
import MessageComponent from './MessageComponent';

// Component to render the slider component
const Slider = () => {
  // Declare state variables to store slider images, loading status and error message
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UseEffect hook to fetch data from the API
  useEffect(() => {
    // Async function to fetch data from API
    const fetchData = async () => {
      try {
        // Setting loading to true before the data is fetched
        setLoading(true);
        // Fetching the data from API
        const result = await axios.get('/api/sliderImages');
        setSliderImages(result.data);
        // Setting loading to false after the data is fetched
        setLoading(false);
      } catch (error) {
        // Updating the state with the error message if there is any error
        setError(error.message);
        // Setting loading to false after the error
        setLoading(false);
      }
    };
    // Invoking the fetchData function to fetch the data
    fetchData();
  }, []);

  // Returning the slider component
  return (
    <>
      {/* Rendering the LoadingComponent if the data is still being fetched */}
      {loading ? (
        <LoadingComponent />
      ) : error ? (
        // Rendering the MessageComponent if there is any error
        <MessageComponent variant="danger">{error}</MessageComponent>
      ) : (
        // Rendering the Carousel component if the data is successfully fetched
        <div style={{ marginBottom: '2rem' }}>
          <Carousel>
            {sliderImages.map((image) => (
              <Carousel.Item key={image._id}>
                <img
                  className="d-block w-100 mx-auto"
                  src={image.url}
                  alt={image.name}
                  style={{ height: '300px' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}
    </>
  );
};

export default Slider;
