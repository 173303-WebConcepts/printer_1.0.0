import React from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

interface PaginationProps {
  paginationData: {
    documentCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

export const Paginations: React.FC<PaginationProps> = ({
  paginationData = { documentCount: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
  onPageChange,
}) => {
  const { totalPages, currentPage } = paginationData;

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate pages to display
  const generatePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Maximum visible pages
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pages.push(i);
        }
        pages.push("...", totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1, "...");
        for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, "...");
        for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) {
          pages.push(i);
        }
        pages.push("...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Previous Arrow */}
      <div
        onClick={() => handlePageChange(currentPage - 1)}
        className={`text-[25px] transition-all duration-500 ease-in-out ${
          currentPage > 1 ? "text-primary hover:text-base-content cursor-pointer" : "cursor-not-allowed text-gray-400"
        }`}
      >
        <FaArrowLeftLong />
      </div>

      {/* Page Numbers */}
      {generatePages().map((page, index) =>
        typeof page === "number" ? (
          <div
            key={index}
            onClick={() => handlePageChange(page)}
            className={`flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full ${
              page === currentPage ? "bg-primary text-primary-content" : "border-primary text-primary border"
            }`}
          >
            {page}
          </div>
        ) : (
          <div key={index} className="text-primary flex h-[40px] w-[40px] items-center justify-center">
            {page}
          </div>
        )
      )}

      {/* Next Arrow */}
      <div
        onClick={() => handlePageChange(currentPage + 1)}
        className={`text-[25px] transition-all duration-500 ease-in-out ${
          currentPage < totalPages ? "text-primary hover:text-base-content cursor-pointer" : "cursor-not-allowed text-gray-400"
        }`}
      >
        <FaArrowRightLong />
      </div>
    </div>
  );
};
