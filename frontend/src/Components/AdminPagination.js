// Import necessary modules
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// AdminPagination component for handling pagination in the admin panel
export default function AdminPagination({
  totalPages,
  setCurrentPage,
  currentPage,
}) {
  // Function to handle click event on page numbers
  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber, currentPage);
  };

  // Function to render page numbers with ellipses for large number of pages
  const renderPageNumbers = () => {
    let pageNumbers = [];
    let prevEllipsisAdded = false;
    let nextEllipsisAdded = false;

    // Loop through all page numbers and generate the buttons
    for (let i = 1; i <= totalPages; i++) {
      // Check if the current page number should be displayed
      if (
        i === 1 ||
        i === 2 ||
        i === totalPages - 1 ||
        i === totalPages ||
        i === currentPage ||
        i === currentPage - 1 ||
        i === currentPage + 1
      ) {
        // Add the page number button to the array
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`btn mx-1 my-3 ${
              i === currentPage ? 'btn-pagination-black' : 'btn-pagination'
            }`}
          >
            {i}
          </button>
        );
        prevEllipsisAdded = false;
        nextEllipsisAdded = false;
      } else if (i < currentPage && !prevEllipsisAdded) {
        // Add the previous ellipsis to the array
        pageNumbers.push(
          <span key={i} className="mx-1 my-3">
            _
          </span>
        );
        prevEllipsisAdded = true;
      } else if (i > currentPage && !nextEllipsisAdded) {
        pageNumbers.push(
          <span key={i} className="mx-1 my-3">
            _
          </span>
        );
        nextEllipsisAdded = true;
      }
    }
    // Return the array of page number buttons and ellipses
    return pageNumbers;
  };

  // Render the pagination component
  return (
    <div className="pagination d-flex justify-content-center">
      {/* Render the previous page button if there are multiple pages */}
      {totalPages > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          disabled={currentPage === 1}
          onClick={() => handleClick(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      {/* Render the page numbers */}
      {renderPageNumbers()}
      {/* Render the next page button if there are multiple pages */}
      {totalPages > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          disabled={currentPage === totalPages}
          onClick={() => handleClick(currentPage + 1)}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
    </div>
  );
}
