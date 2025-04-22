import { useSelector, useDispatch } from "react-redux";
import { updateTotalPages } from "../../redux/Slice/shopSlice";
import { useEffect, useState } from "react";
import Cards from "../Global/Card";
import api from "../../api/api";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  //Access the category state and filters of that category from the redux store
  const currCategory = useSelector((state) => state.shop.currCategory);
  const activeFilters = useSelector((state) => state.shop.activeFilters);
  const currPage = useSelector((state) => state.shop.currPage);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Format the filter data for the API
        const productConstraints = {
          activeFilters: activeFilters.activeFilters || [],
          price: activeFilters.price || 0,
          sortBy: activeFilters.sortBy || "popular",
        };

        console.log("Sending to API:", {
          category: currCategory.toLowerCase(),
          productConstraints,
        });

        const response = await api.getProducts(
          currCategory.toLowerCase(),
          productConstraints,
          currPage
        );

        if (response.data.success) {
          setProducts(response.data.currPageProducts);
          dispatch(updateTotalPages(response.data.totalPages));
        } else {
          console.error("Failed to fetch products:", response.data.message);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [currCategory, activeFilters, currPage]);

  console.log("products");
  console.log(products);

  return (
    <div className="w-full h-[600px] overflow-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-2">
        {/* Key prop helps React identify which items have changed, been added, or been removed in lists */}
        {products.map((product) => (
          <Cards key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
