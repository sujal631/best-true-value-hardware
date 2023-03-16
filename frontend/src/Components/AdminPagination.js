import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function AdminPagination({
  totalPages,
  setCurrentPage,
  currentPage,
}) {
  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    let pageNumbers = [];
    let prevEllipsisAdded = false;
    let nextEllipsisAdded = false;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === 2 ||
        i === totalPages - 1 ||
        i === totalPages ||
        i === currentPage ||
        i === currentPage - 1 ||
        i === currentPage + 1
      ) {
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
    return pageNumbers;
  };

  return (
    <div className="pagination d-flex justify-content-center">
      {totalPages > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          disabled={currentPage === 1}
          onClick={() => handleClick(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      {renderPageNumbers()}
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
