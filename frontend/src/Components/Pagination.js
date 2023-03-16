import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}) => {
  let pages = [];

  for (
    let counter = 1;
    counter <= Math.ceil(totalPosts / postsPerPage);
    counter++
  ) {
    pages.push(counter);
  }

  const getPaginationItems = () => {
    const paginationItems = [];

    for (let i = 0; i < pages.length; i++) {
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
        paginationItems.push(
          <span key={i} className="mx-1 my-3">
            ...
          </span>
        );
      }
    }

    return paginationItems;
  };

  return (
    <div className="pagination d-flex justify-content-center">
      {pages.length > 1 && (
        <button
          className="btn mx-1 my-3 btn-pagination"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      {getPaginationItems()}
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
