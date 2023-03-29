//Import necessary modules
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Pagination component for handling pagination of a list
const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}) => {
  let pages = [];

  // Calculate the total number of pages based on totalPosts and postsPerPage
  for (
    let counter = 1;
    counter <= Math.ceil(totalPosts / postsPerPage);
    counter++
  ) {
    pages.push(counter);
  }

  // Function to generate the pagination items
  const getPaginationItems = () => {
    const paginationItems = [];

    // Loop through the pages and create pagination items
    for (let i = 0; i < pages.length; i++) {
      // Add pagination items for first, last, and three pages around currentPage
      if (
        i === 0 ||
        i === pages.length - 1 ||
        i === currentPage - 2 ||
        i === currentPage ||
        i === currentPage - 1
      ) {
        paginationItems.push(
          <button
            key={i}
            onClick={() => setCurrentPage(pages[i])}
            className={`btn mx-1 my-3 ${
              pages[i] === currentPage
                ? 'btn-pagination-black'
                : 'btn-pagination'
            }`}
          >
            {pages[i]}
          </button>
        );
      } else if (i === 1 || i === pages.length - 2) {
        // Add ellipsis for pagination items that are not displayed
        paginationItems.push(
          <span key={i} className="mx-1 my-3">
            ...
          </span>
        );
      }
    }

    return paginationItems;
  };

  // Render the pagination component
  return (
    <div className="pagination d-flex justify-content-center">
      {/* Render the left arrow button for previous page */}
      {pages.length > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      {/* Render the pagination items */}
      {getPaginationItems()}

      {/* Render the right arrow button for next page */}
      {pages.length > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
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
