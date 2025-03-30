import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Cards from "./Card";
import api from "../../api/api";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  //Access the category state from the redux store
  const currCategory = useSelector((state) => state.category.currCategory);
  console.log(currCategory);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts(currCategory.toLowerCase()); //gets products from server
        if (response.data.success) {
          setProducts(response.data.products);
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
  }, [currCategory]);

  console.log("products");
  console.log(products);

  return (
    <div className="w-1/2 h-[750px] overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {/* Key prop helps React identify which items have changed, been added, or been removed in lists */}
        {products.map((product) => (
          <Cards key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
