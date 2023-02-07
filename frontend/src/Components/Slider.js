import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';

const Slider = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await axios.get('/api/sliderImages');
        setSliderImages(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
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
