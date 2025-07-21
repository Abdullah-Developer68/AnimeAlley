import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { addToCart } from "../redux/Slice/cartSlice";
import { addToCartAsync } from "../redux/Slice/cartThunks";
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
  const [itemQuantity, setItemQuantity] = useState(1);
  const [stockStatus, setStockStatus] = useState({});

  const totalPrice = itemQuantity * selectedProduct.price;

  // Set up variant options based on product category
  useEffect(() => {
    if (selectedProduct.category === "comics") {
      setVariantOptions(selectedProduct.volumes || []);
      setVariantLabel("Select the volume:");
      // Initialize stock status for all volumes
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
      // Initialize stock status for all sizes
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
    if (
      selectedVariant &&
      stockStatus[selectedVariant]?.stockAvailable > itemQuantity
    ) {
      setItemQuantity((prev) => prev + 1);
    } else {
      toast.error(
        `Only ${
          stockStatus[selectedVariant]?.stockAvailable || 0
        } items available`
      );
    }
  };

  const decreaseQuantity = () => {
    if (itemQuantity > 1) {
      setItemQuantity((prev) => prev - 1);
    }
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
      if (res.data.success) {
        setStockStatus((prev) => ({
          ...prev,
          [selectedVariant]: {
            stockAvailable: res.data.stockAvailable,
            isAvailable: res.data.isAvailable,
          },
        }));

        if (!res.data.isAvailable) {
          toast.error(res.data.message);
          setItemQuantity(Math.min(itemQuantity, res.data.stockAvailable));
        }
      }
    } catch (error) {
      console.error("Error checking stock:", error);
    }
  };

  useEffect(() => {
    if (selectedProduct.name && selectedVariant) {
      checkStock(selectedVariant, itemQuantity);
    }
  }, [selectedProduct.name, selectedVariant, itemQuantity]);

  //  add to cart
  const handleAddToCart = () => {
    // Validate selections before adding to cart
    if (!selectedVariant && variantOptions.length > 0) {
      toast.error("Please select a variant");
      return;
    }

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
                src={`${selectedProduct.image}`}
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
              </div>
              <span className="px-4 py-1.5 bg-pink-500 text-black text-sm font-medium rounded-full">
                {Array.isArray(selectedProduct.genres)
                  ? selectedProduct.genres.join(", ")
                  : ""}
              </span>
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
