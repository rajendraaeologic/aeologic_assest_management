import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { getPaginationRange } from "../../utils/paginationUtils";

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
  previousLabel = "❮ Previous",
  nextLabel = "Next ❯",
}) => {
  const paginationRange = useMemo(
    () => getPaginationRange({ currentPage, totalPages, siblingCount: 1 }),
    [currentPage, totalPages]
  );

  // Hide pagination if no data
  if (totalPages < 1 || currentPage === 0) return null;

  return (
    <nav
      className="flex justify-center items-center mt-6"
      aria-label="Pagination Navigation"
    >
      <ul className="flex border rounded-lg shadow-sm px-2 py-1 overflow-x-auto flex-wrap">
        {/* Previous Button */}
        <li>
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`px-3 py-1 rounded-l-md text-gray-600 flex items-center gap-1 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            {previousLabel}
          </button>
        </li>

        {/* Page Numbers */}
        {paginationRange.map((page, idx) => (
          <li key={`${page}-${idx}`}>
            {page === "..." ? (
              <span className="px-3 py-1 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`px-3 py-1 rounded border ${
                  currentPage === page
                    ? "bg-[#3bc0c3] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`px-3 py-1 rounded-r-md text-gray-600 flex items-center gap-1 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            {nextLabel}
          </button>
        </li>
      </ul>
    </nav>
  );
};

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  previousLabel: PropTypes.string,
  nextLabel: PropTypes.string,
};

export default PaginationControls;
