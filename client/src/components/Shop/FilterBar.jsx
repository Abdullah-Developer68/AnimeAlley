import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { openFilterBar, transferFilterData } from "../../redux/Slice/shopSlice";
import assets from "../../assets/asset";
import { useState, useEffect } from "react";

const FilterBar = () => {
  // Get current category and filter bar state from Redux store
  const currCategory = useSelector((state) => state.shop.currCategory);
  const barState = useSelector((state) => state.shop.openFilterBar);
  const [price, setPrice] = useState(0);
  const dispatch = useDispatch();

  // Initialize form with react-hook-form
  const { register, handleSubmit } = useForm({
    defaultValues: {
      activeFilters: [], //because there are more than 1 filters we will use react-hook-form to make them an array
      price,
      sortBy: "popular",
    },
  });

  const getBackgroundStyle = (value) => {
    const percentage = (value / 2000) * 100;
    return {
      background: `linear-gradient(to right, #EAB308 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`,
    };
  };

  const [availFilters, setAvailFilters] = useState([]);
  useEffect(() => {
    let newFilters = [];
    if (currCategory === "comics") {
      newFilters = ["Action", "Adventure", "Fantasy", "Sci-Fi", "Horror"];
    } else if (currCategory === "action figures") {
      newFilters = ["Marvel", "DC", "Anime"];
    } else if (currCategory === "clothes") {
      newFilters = ["T-Shirts", "Jackets", "Pants"];
    } else if (currCategory === "shoes") {
      newFilters = ["Sneakers", "Boots"];
    } else if (currCategory === "toys") {
      newFilters = ["Action Figures", "Dolls", "Cars"];
    }
    setAvailFilters(newFilters);
  }, [currCategory]);

  // Handle form submission
  const onSubmit = (data) => {
    console.log("Raw Form Data:", data);
    const formData = {
      activeFilters:
        data.activeFilters?.map((filter) => filter.toLowerCase()) || [],
      sortBy: data.sortBy?.toLowerCase() || "popular",
      price,
    };
    console.log("Processed Form Data:", formData);
    // dispatch actions to update the product list based on filters
    dispatch(transferFilterData(formData));
  };

  return (
    // Main container with full height and proper styling
    <div className="w-[250px] h-[820px] lg:h-[900px] bg-black/95 backdrop-blur-sm p-4 shadow-xl border border-white/10 rounded-lg overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Category Filters Section */}
        <div className="mb-12 mt-4">
          {/* Header with close button for mobile */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/90 font-semibold text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
              Filters
            </h3>
            {/* Close button - only visible on mobile */}
            <img
              src={assets.close}
              alt="close"
              className="w-8 cursor-pointer lg:hidden"
              onClick={() => dispatch(openFilterBar(!barState))}
            />
          </div>
          {/* Category filter checkboxes */}
          <div className="space-y-2 text-white/70">
            {availFilters.map((availFilter) => (
              <label
                key={availFilter}
                className="flex items-center gap-2 hover:text-yellow-500 cursor-pointer text-sm transition-colors duration-200 group"
              >
                {/* because there are more than 1 filters here the react-hook-form will make them an array */}
                <input
                  type="checkbox"
                  value={availFilter}
                  {...register("activeFilters")}
                  className="accent-yellow-500 w-4 h-4 border-white/20 focus:ring-yellow-500 focus:ring-offset-1 focus:ring-offset-black"
                />
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {availFilter}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Slider Section */}
        <div className="mb-16">
          <h3 className="text-white/90 font-semibold mb-3 text-base flex items-center gap-2">
            <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
            Price Range
          </h3>
          <div className="relative">
            {/* Custom styled range input with dynamic background */}
            <input
              type="range"
              min="0"
              max="2000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={getBackgroundStyle(price)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
            />
            {/* Price labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-white/70 text-sm">
              <span>Rs. 0</span>
              <span>Rs. {price}</span>
              <span>Rs. 2000</span>
            </div>
          </div>
        </div>

        {/* Sort Options Section */}
        <div className="mb-6">
          <h3 className="text-white/90 font-semibold mb-3 text-base flex items-center gap-2">
            <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
            Sort By
          </h3>
          {/* Sort dropdown with custom styling */}
          <select
            {...register("sortBy")}
            className="w-full bg-white/10 text-white/70 p-2 rounded-lg border border-white/20 outline-none focus:border-yellow-500/50 transition-all duration-300 text-sm cursor-pointer hover:bg-white/15"
          >
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
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Apply Filters</span>
          {/* Filter icon */}
          <img src={assets.funnel} alt="funnel" className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FilterBar;
