export const getPaginationRange = ({
  currentPage,
  totalPages,
  siblingCount = 1,
}) => {
  if (totalPages < 1) return [];

  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), "...", totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, "...", ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [1, "...", ...range(leftSibling, rightSibling), "...", totalPages];
};

const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => start + idx);
};
