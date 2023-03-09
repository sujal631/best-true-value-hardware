// Import necessary modules from 'react-bootstrap' and 'react-router-dom'
import React from 'react';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Defining a functional component 'Search'
export default function Search() {
  // 'useNavigate' hook to get a reference to the navigate function
  const navigate = useNavigate();

  const submitHandler = (e) => {
    // submit handler function which prevents the default form submission event and uses the 'navigate' function to change the URL to a search URL containing the search query parameter
    e.preventDefault();
    navigate(`/search/?query=${e.target.q.value}`);
  };

  return (
    //Search box with an input field and a submit button
    <Form className="search-form d-flex me-auto" onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          type="text"
          name="q"
          id="q"
          placeholder="Search"
          aria-label="Search"
          aria-describedby="button-search"
          className="search-input"
        />
        <Button
          variant="primary"
          type="submit"
          id="button-search"
          className="search-button"
        >
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}
