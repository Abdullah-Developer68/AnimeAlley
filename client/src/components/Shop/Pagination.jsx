/* eslint-disable react/prop-types */
import assets from "../../assets/asset";

const Pagination = ({ currentPage = 1, totalPages = 10 }) => {
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`h-8 w-8 mx-1 flex items-center justify-center rounded-full ${
            currentPage === i
              ? "bg-red-600 text-black cursor-pointer"
              : "bg-white text-gray-700 hover:bg-red-400 cursor-pointer"
          } transition-colors duration-300 text-sm font-medium`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center my-8">
      <button
        className="h-8 px-4 ml-2 flex items-center justify-center rounded-full bg-gray-500 border-gray-300 cursor-pointer"
        disabled={currentPage === 1}
      >
        <img src={assets.prevBtn} alt="Previous" className="h-4 w-4" />
      </button>

      <div className="flex items-center">{renderPageNumbers()}</div>

      <button
        className="h-8 px-4 ml-2 flex items-center justify-center rounded-full bg-gray-500 border-gray-300 cursor-pointer"
        disabled={currentPage === totalPages}
      >
        <img src={assets.nextBtn} alt="Next" className="h-4 w-4 bg-" />
      </button>
    </div>
  );
};

export default Pagination;
