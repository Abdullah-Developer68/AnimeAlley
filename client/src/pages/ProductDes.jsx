import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { addToCartAsync } from "../redux/Slice/cartThunks";

const ProductDescription = () => {
  const dispatch = useDispatch();

  // Get product data from Redux store
  const selectedProduct = useSelector((state) => state.shop.productData);
  const cartId = useSelector((state) => state.cart.cartId);

  // States for managing product variants and selections
  const [variantOptions, setVariantOptions] = useState([]);
  const [variantLabel, setVariantLabel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const totalPrice = itemQuantity * selectedProduct.price;

  // Initialize variant options based on product category
  useEffect(() => {
    if (selectedProduct.category === "comics") {
      setVariantOptions(selectedProduct.volumes || []);
      setVariantLabel("Volume");
      setSelectedVariant(selectedProduct.volumes?.[0] || "");
    } else if (
      selectedProduct.category === "clothes" ||
      selectedProduct.category === "shoes"
    ) {
      setVariantOptions(selectedProduct.sizes || []);
      setVariantLabel("Size");
      setSelectedVariant(selectedProduct.sizes?.[0] || "");
    } else {
      setVariantOptions([]);
      setVariantLabel("");
      setSelectedVariant("");
    }
  }, [selectedProduct]);

  const variantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const increaseQuantity = () => {
    setItemQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (itemQuantity > 1) {
      setItemQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      toast.error("Product not found");
      return;
    }

    // Validate variant selection for products that require variants
    if (
      (selectedProduct.category === "comics" ||
        selectedProduct.category === "clothes" ||
        selectedProduct.category === "shoes") &&
      !selectedVariant
    ) {
      toast.error(`Please select a ${variantLabel.toLowerCase()}`);
      return;
    }

    setIsAddingToCart(true);

    try {
      const resultAction = await dispatch(
        addToCartAsync({
          cartId,
          productId: selectedProduct._id,
          variant: selectedVariant,
          requestedQuantity: itemQuantity,
          productData: selectedProduct,
        })
      );

      if (addToCartAsync.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message);
        // Reset quantity after successful addition
        setItemQuantity(1);
      } else {
        // Error handling is done in the thunk
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.log(error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b0133] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/shop" className="text-pink-500 hover:underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0133] to-black text-white">
      {/* Navigation Header */}
      <Link to="/shop">
        <div className="fixed top-16 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-3">
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
          {/* Image Section */}
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
                {selectedProduct.genres &&
                  Array.isArray(selectedProduct.genres) && (
                    <span className="px-4 py-1.5 bg-pink-500 text-black text-sm font-medium rounded-full">
                      {selectedProduct.genres.join(", ")}
                    </span>
                  )}
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-base leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Variant Selection */}
            {variantOptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-white/90 font-medium">{variantLabel}</h3>
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
            )}

            {/* Quantity Selection */}
            <div className="space-y-4">
              <h3 className="text-white/90 font-medium">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  disabled={itemQuantity <= 1}
                  className="w-12 h-12 rounded-lg bg-white/10 text-white hover:bg-pink-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <div>
                <p className="text-white/60">Total Price</p>
                <p className="text-3xl font-bold text-white">{totalPrice} $</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="px-8 py-4 bg-pink-500 text-black rounded-xl font-medium hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
