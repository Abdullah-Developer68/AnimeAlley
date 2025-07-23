import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { addToCart } from "../redux/Slice/cartSlice";
import { addToCartAsync } from "../redux/Thunk/cartThunks";
import { Link } from "react-router-dom";
import api from "../api/api";
import assets from "../assets/asset";
import { toast } from "react-toastify";

const ProductDescription = () => {
  const dispatch = useDispatch();

  // Get product data from Redux store
  const selectedProduct = useSelector((state) => state.shop.productData);

  // States for managing product variants and selections
  const [variantOptions, setVariantOptions] = useState([]);
  const [variantLabel, setVariantLabel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [stockStatus, setStockStatus] = useState({});

  const totalPrice = itemQuantity * selectedProduct.price;

  // Set up variant options based on product category
  useEffect(() => {
    if (selectedProduct.category === "comics") {
      setVariantOptions(selectedProduct.volumes || []);
      setVariantLabel("Select the volume:");
      // Initialize stock status for volumes
      const initialStockStatus = {};
      selectedProduct.volumes?.forEach((volume) => {
        initialStockStatus[volume] = {
          stockAvailable: selectedProduct.stock[volume] || 0,
          isAvailable: (selectedProduct.stock[volume] || 0) > 0,
        };
      });
      setStockStatus(initialStockStatus);
    } else if (
      selectedProduct.category === "clothes" ||
      selectedProduct.category === "shoes"
    ) {
      setVariantOptions(selectedProduct.sizes || []);
      setVariantLabel("Select the size:");
      // Initialize stock status for sizes
      const initialStockStatus = {};
      selectedProduct.sizes?.forEach((size) => {
        initialStockStatus[size] = {
          stockAvailable: selectedProduct.stock[size] || 0,
          isAvailable: (selectedProduct.stock[size] || 0) > 0,
        };
      });
      setStockStatus(initialStockStatus);
    }
  }, [selectedProduct]);

  // for quantity changes
  const increaseQuantity = () => {
    if (selectedVariant && selectedVariant !== "")
      setItemQuantity((prev) => prev + 1);
    else toast.error("Please select a variant before increasing quantity");
  };

  const decreaseQuantity = () => {
    if (selectedVariant && selectedVariant !== "")
      setItemQuantity((prev) => prev - 1);
    else toast.error("Please select a variant before decreasing quantity");
  };

  //  variant selection
  const variantSelect = (variant) => {
    if (stockStatus[variant]?.stockAvailable > 0) {
      setSelectedVariant(variant);
      setItemQuantity(1);
    } else {
      toast.error("This variant is out of stock");
    }
  };

  const checkStock = async (selectedVariant, itemQuantity) => {
    try {
      const res = await api.verifyStock(
        selectedProduct.name,
        selectedVariant,
        itemQuantity
      );
      // update stock status
      if (res.data.success) {
        setStockStatus((prev) => ({
          ...prev,
          [selectedVariant]: {
            stockAvailable: res.data.stockAvailable,
            isAvailable: res.data.isAvailable,
          },
        }));
        // if stock falls short set itemQuantity to max available
        if (!res.data.isAvailable) {
          toast.error(res.data.message);
          setItemQuantity(Math.min(itemQuantity, res.data.stockAvailable));
        }
      }
    } catch (error) {
      console.error("Error checking stock:", error);
    }
  };

  //  add to cart
  const handleAddToCart = () => {
    // Validate selections before adding to cart
    if (!selectedVariant && variantOptions.length > 0) {
      toast.error("Please select a variant");
      return;
    }
    if (itemQuantity <= 0) {
      toast.error("Please select a valid quantity");
      return;
    }
    // Check stock availability and if it falls short add to cart with max available stock
    checkStock(selectedVariant, itemQuantity);

    if (!stockStatus[selectedVariant]?.isAvailable) {
      toast.error(
        `Only ${
          stockStatus[selectedVariant]?.stockAvailable || 0
        } items available`
      );
      return;
    }

    dispatch(
      addToCartAsync({
        product: selectedProduct,
        variant: selectedVariant,
        quantity: itemQuantity,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Added to cart successfully!");
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0133] to-black text-white">
      {/* Back Navigation */}
      <Link to="/shop">
        <div className="fixed top-12 md:top-14 lg:top-16 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
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

      <div className="flex justify-center items-center mt-16 mx-auto px-4 pt-28 pb-24">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
          {/* Image Section - Made smaller and more compact */}
          <div className="rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-500/5 bg-white/5 backdrop-blur-sm p-4">
            <div className="aspect-square max-w-md mx-auto">
              <img
                src={`${selectedProduct.image}`}
                alt={selectedProduct.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 rounded-lg"
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
              <div className="flex gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-gray-500 text-black text-sm font-medium rounded-md">
                    {selectedProduct.category === "comics"
                      ? "Comic"
                      : selectedProduct.category === "clothes" ||
                        selectedProduct.category === "shoes"
                      ? selectedProduct.merchType
                      : "Clothing"}
                  </span>
                </div>
                {selectedProduct.category === "comics" && (
                  <span className="px-4 py-1.5 bg-gray-500 text-black text-sm font-medium rounded-md">
                    {Array.isArray(selectedProduct.genres)
                      ? selectedProduct.genres.join(", ")
                      : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-base leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Size/Volume Selection */}
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
                          : stockStatus[variant]?.stockAvailable > 0
                          ? "bg-white/10 text-white/70 hover:bg-white/20"
                          : "bg-red-500/20 text-red-500/70 cursor-not-allowed"
                      }`}
                    disabled={stockStatus[variant]?.stockAvailable === 0}
                  >
                    {variant}
                    {stockStatus[variant]?.stockAvailable === 0 &&
                      " (Out of Stock)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Price Row */}
            <div className="space-y-4">
              <h3 className="text-white/90 font-medium">Quantity</h3>
              <div className="flex items-center justify-between gap-6">
                {/* Quantity Controls */}
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

                {/* Static Price Display */}
                <div className="text-right">
                  <p className="text-white/60 text-sm">Unit Price</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    ${selectedProduct.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Price and Cart */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <div>
                <p className="text-white/60">Total Price</p>
                <p className="text-3xl font-bold text-white">{totalPrice} $</p>
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
      </div>
    </div>
  );
};

export default ProductDescription;
