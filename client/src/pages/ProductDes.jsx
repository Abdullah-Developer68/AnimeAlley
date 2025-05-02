import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../redux/Slice/cartSlice";
import { Link } from "react-router-dom";
import assets from "../assets/asset";

const ProductDescription = () => {
  const dispatch = useDispatch();

  // Get product data from Redux store
  const selectedProduct = useSelector((state) => state.shop.productData);

  // States for managing product variants and selections
  const [variantOptions, setVariantOptions] = useState([]);
  const [variantTitle, setVariantTitle] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

  // Calculate total price based on quantity
  const totalPrice = selectedProduct.price * itemQuantity;

  // Set up variant options based on product category
  useEffect(() => {
    if (selectedProduct.category === "comics") {
      setVariantOptions(selectedProduct.volume || []);
      setVariantTitle("Select the volume:");
    } else if (
      selectedProduct.category === "clothes" ||
      selectedProduct.category === "shoes"
    ) {
      setVariantOptions(selectedProduct.size || []);
      setVariantTitle("Select the size:");
    }
  }, [selectedProduct]);

  // for quantity changes
  const increaseQuantity = () => {
    setItemQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (itemQuantity > 1) {
      setItemQuantity((prev) => prev - 1);
    }
  };

  //  variant selection
  const variantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  //  add to cart
  const handleAddToCart = () => {
    // Validate selections before adding to cart
    if (!selectedVariant && variantOptions.length > 0) {
      alert("Please select a variant");
      return;
    }
    const cartItem = {
      ...selectedProduct,
      selectedVariant,
      itemQuantity,
    };

    console.log("Adding to cart:", cartItem);
    // Add dispatch logic here
    dispatch(addToCart(cartItem));
    alert("Added to cart successfully!");
  };

  // Add this state for review filtering
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all', 'top', 'new'

  // Add this helper function for filtering reviews
  const getFilteredReviews = (reviews) => {
    switch (reviewFilter) {
      case "top":
        return [...reviews].sort((a, b) => b.rating - a.rating);
      case "new":
        return [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
      default:
        return reviews;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0133] to-black text-white">
      {/* Back Navigation */}
      <Link to="/shop">
        <div className="fixed top-16 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-3">
            {/* Back button */}
            <button className="flex items-center gap-2 text-white/70 hover:text-pink-500 transition-colors cursor-pointer">
              <img
                src={assets.prevBtn}
                alt=""
                className="w-4 bg-yellow-500 rounded-full p-1"
              />
              Back
            </button>
          </div>
        </div>
      </Link>

      <div className="container mx-auto px-4 pt-28 pb-24">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section - Modified height */}
          <div className="rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-500/5 bg-white/5 backdrop-blur-sm p-6">
            <div className="aspect-[4/3]">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-8">
            {/* Title and Badges */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {selectedProduct.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 bg-pink-500 text-black text-sm font-medium rounded-full">
                  {selectedProduct.category}
                </span>
                <div className="flex items-center bg-white/10 px-4 py-1.5 rounded-full">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white/70 text-sm ml-1.5">
                    {selectedProduct.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-base leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Size/Volume Selection */}
            <div className="space-y-4">
              <h3 className="text-white/90 font-medium">{variantTitle}</h3>
              <div className="flex flex-wrap gap-3">
                {variantOptions.map((variant) => (
                  <button
                    key={variant}
                    onClick={() => variantSelect(variant)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 cursor-pointer
                      ${
                        selectedVariant === variant
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-white/90 font-medium">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="w-12 h-12 rounded-lg bg-white/10 text-white hover:bg-pink-500/20 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-16 text-center text-lg font-medium">
                  {itemQuantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="w-12 h-12 rounded-lg bg-white/10 text-white hover:bg-pink-500/20 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price and Cart */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <div>
                <p className="text-white/60">Total Price</p>
                <p className="text-3xl font-bold text-white">Rs. 1,999</p>
              </div>
              <button
                onClick={handleAddToCart}
                className="px-8 py-4 bg-pink-500 text-black rounded-xl font-medium hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            <div className="flex flex-wrap gap-3">
              {["All Reviews", "Top Rated", "Recent", "Add review"].map(
                (filter) => (
                  <button
                    key={filter}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((review) => (
              <div
                key={review}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" />
                  <div>
                    <h4 className="font-medium text-white/90">Customer Name</h4>
                    <div className="flex items-center gap-1 text-yellow-400">
                      ★★★★★
                    </div>
                  </div>
                </div>
                <p className="text-white/70">
                  Amazing product! The quality exceeded my expectations...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((product) => (
              <div
                key={product}
                className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-white/5">
                  <img
                    src={assets.genos}
                    alt="Similar Product"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white/90 font-medium mb-2">
                    Product Name
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text font-bold">
                      Rs. 1,999
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white/70">4.5</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
