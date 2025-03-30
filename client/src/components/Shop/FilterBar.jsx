import { useSelector } from "react-redux";

const FilterBar = () => {
  const currCategory = useSelector((state) => state.category.currCategory);

  let filters = [];
  if (currCategory === "comics") {
    //genres for comics
    filters = ["Action", "Adventure", "Fantasy", "Sci-Fi", "Horror"];
  } else if (currCategory === "action figures") {
    //genres for action figures
    filters = ["Marvel", "DC", "Anime"];
  } else if (currCategory === "clothes") {
    //genres for clothes
    filters = ["T-Shirts", "Jackets", "Pants"];
  } else if (currCategory === "shoes") {
    //genres for shoes
    filters = ["Sneakers", "Boots"];
  } else if (currCategory === "toys") {
    //genres for toys
    filters = ["Action Figures", "Dolls", "Cars"];
  }

  return (
    <div className="w-full max-w-[280px] min-h-full bg-black p-4 shadow-lg border border-white/10">
      {/* Category Section */}
      <div className="mb-6">
        <h3 className="text-white/90 font-medium mb-3">Filters</h3>
        <div className="space-y-2 text-white/70">
          {filters.map((filter) => (
            <label
              key={filter}
              className="flex items-center gap-2 hover:text-yellow-500 cursor-pointer"
            >
              <input type="checkbox" className="accent-yellow-500" />
              <span>{filter}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <h3 className="text-white/90 font-medium mb-3">Price Range</h3>
        <input
          type="range"
          min="0"
          max="2000"
          defaultValue={1000}
          className=" w-full h-1 rounded-lg"
        />
        <div className="flex justify-between text-white/70 mt-2">
          <span>₹0</span>
          <span>₹2000</span>
        </div>
      </div>

      {/* Sort By Section */}
      <div className="mb-6">
        <h3 className="text-white/90 font-medium mb-3">Sort By</h3>
        <select className="w-full bg-white/10 text-white/70 p-2 rounded-lg border border-white/20 outline-none focus:border-pink-500/50 transition-all duration-300">
          <option value="popular" className="bg-black">
            Most Popular
          </option>

          <option value="price-low" className="bg-black">
            Price: Low to High
          </option>
          <option value="price-high" className="bg-black">
            Price: High to Low
          </option>
        </select>
      </div>

      {/* Apply Filters Button */}
      <button className="w-full py-2 rounded-lg bg-yellow-500 text-black font-medium hover:shadow-lg">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterBar;
