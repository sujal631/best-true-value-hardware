//Importing necessary libraries
import React from 'react';

//Importing necessary and icons from fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Pagination component to show page navigation buttons
const Pagination = ({
  // Total number of posts to be displayed
  totalPosts,
  // Number of posts to be displayed per page
  postsPerPage,
  // Function to set the current page
  setCurrentPage,
  // Current page number
  currentPage,
}) => {
  let pages = [];

  // Calculate the number of pages needed based on the total number of posts and posts per page
  for (
    let counter = 1;
    counter <= Math.ceil(totalPosts / postsPerPage);
    counter++
  ) {
    pages.push(counter);
  }

  return (
    <div className="pagination d-flex justify-content-center">
      {/* Display left arrow button if there is more than one page */}
      {pages.length > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          // Disable left arrow button if the current page is the first page
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      {/* Loop through pages and display a button for each page */}
      {pages.map((page, index) => {
        return (
          <button
            key={index}
            onClick={() => setCurrentPage(page)}
            // Distinguish the current page by applying different styles
            className={`btn mx-1 my-3 ${
              page === currentPage ? 'btn-pagination-black' : 'btn-pagination'
            }`}
          >
            {page}
          </button>
        );
      })}
      {/* Display right arrow button if there is more than one page */}
      {pages.length > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          // Disable right arrow button if the current page is the last page
          disabled={currentPage === pages.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
    </div>
  );
};

export default Pagination;
