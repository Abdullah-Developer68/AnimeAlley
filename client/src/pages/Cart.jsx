import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  applyCoupon,
  resetCoupon,
  setFinalCost,
} from "../redux/Slice/cartSlice";
import {
  incrementCartItemAsync,
  decrementCartItemAsync,
  removeFromCartAsync,
  clearCartAsync,
  verifyCartBeforeCheckoutAsync,
} from "../redux/Slice/cartThunks";
import StripeButton from "../components/Cart/StripeButton";
import { useState, useEffect } from "react";
import assets from "../assets/asset";
import api from "../api/api";
import { toast } from "react-toastify";

const Cart = () => {
  // Redux setup
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const couponApplied = useSelector((state) => state.cart.couponApplied);
  const couponCode = useSelector((state) => state.cart.couponCode);
  const couponDiscount = useSelector((state) => state.cart.couponDiscount);
  const couponCartCount = useSelector((state) => state.cart.couponCartCount);
  const finalCost = useSelector((state) => state.cart.finalCost);
  const cartId = useSelector((state) => state.cart.cartId);

  // Constants
  const SHIPPING_COST = 5;

  // State management
  const [deliveryAddress, setDeliveryAddress] = useState(
    localStorage.getItem("deliveryAddress")
      ? localStorage.getItem("deliveryAddress")
      : ""
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponInput, setCouponInput] = useState(couponCode);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [loadingItems, setLoadingItems] = useState({}); // Track loading state for individual items

  // Price calculations
  const calculateSubtotal = () => {
    return Math.round(
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity, // Updated property name
        0
      )
    );
  };

  const subtotal = calculateSubtotal();

  // Update final cost when cart or coupon changes
  useEffect(() => {
    if (cartItems.length === 0) {
      dispatch(resetCoupon());
      setOriginalPrice(0);
      return;
    }

    const totalBeforeDiscount = subtotal + SHIPPING_COST;
    setOriginalPrice(totalBeforeDiscount);

    if (!couponApplied || couponDiscount === 0) {
      dispatch(resetCoupon());
      dispatch(setFinalCost(totalBeforeDiscount));
    } else {
      const discountedPrice = Math.round(subtotal * (1 - couponDiscount / 100));
      const newFinalCost = Math.round(discountedPrice + SHIPPING_COST);
      dispatch(
        applyCoupon({
          couponCode: couponCode,
          discountedPrice,
          finalCost: newFinalCost,
          discountPercentage: couponDiscount,
        })
      );
    }
  }, [
    cartItems,
    subtotal,
    SHIPPING_COST,
    couponApplied,
    couponDiscount,
    couponCode,
    dispatch,
  ]);

  // Update localStorage when delivery address changes
  useEffect(() => {
    localStorage.setItem("deliveryAddress", deliveryAddress);
  }, [deliveryAddress]);

  // Show toast when new items are added after coupon is applied
  useEffect(() => {
    if (
      couponApplied &&
      couponCartCount > 0 &&
      cartItems.length > couponCartCount
    ) {
      toast.info("Coupon discount won't apply to newly added items");
    }
  }, [cartItems.length, couponApplied, couponCartCount]);

  // Coupon handling
  const handleCouponCode = async () => {
    if (couponApplied) {
      toast.error("Coupon has been used!");
      return;
    }

    if (!couponInput) {
      toast.error("If you have a coupon code, please enter it.");
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        toast.error("Please login to apply coupon");
        return;
      }

      const response = await api.post("/coupon/verifyCoupon", {
        couponCode: couponInput.trim(),
        userEmail: userInfo.email,
      });

      if (response.data.success === false) {
        toast.error("Invalid coupon code");
        return;
      }

      const coupon = response.data?.coupondata?.coupon;

      if (coupon) {
        const discount = coupon.discountPercentage;
        const discountedPrice = Math.round(subtotal * (1 - discount / 100));
        const newFinalCost = Math.round(discountedPrice + SHIPPING_COST);

        dispatch(
          applyCoupon({
            couponCode: couponInput.trim(),
            discountedPrice,
            finalCost: newFinalCost,
            discountPercentage: discount,
          })
        );

        setTimeout(() => {
          toast.success(`Coupon applied! New total: ${newFinalCost} $`);
        }, 500);
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying coupon");
    }
  };

  // Order placement with cart verification
  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    try {
      // Verify cart before checkout
      await dispatch(
        verifyCartBeforeCheckoutAsync({
          cartItems,
          cartId,
        })
      ).unwrap();

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // Place order logic here - you may need to update this based on your order API
      await api.post("/order/placeOrder", {
        cartItems,
        couponCode,
        subtotal,
        finalCost,
        SHIPPING_COST,
        userInfo,
        deliveryAddress,
        paymentMethod,
        cartId,
      });

      // Clear cart after successful order
      await dispatch(clearCartAsync({ cartItems, cartId })).unwrap();

      // Reset states
      dispatch(resetCoupon());
      setCouponInput("");
      setPaymentMethod("cod");

      toast.success("Order placed successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  // Helper function to render variant badge
  const renderVariantBadge = (item) => {
    if (!item.selectedVariant) return null;

    const variantText =
      item.category === "clothes" || item.category === "shoes"
        ? `Size: ${item.selectedVariant}`
        : `Volume: ${item.selectedVariant}`;

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30 w-fit mx-auto sm:mx-0 mb-2">
        {variantText}
      </span>
    );
  };

  // Quantity handlers - Updated to use new atomic reservation system
  const handleIncreaseQuantity = async (item) => {
    const itemKey = `${item._id}-${item.selectedVariant}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: "increasing" }));

    try {
      await dispatch(
        incrementCartItemAsync({
          cartId,
          productId: item._id,
          variant: item.selectedVariant,
        })
      ).unwrap();
      // Error handling is done in the thunk so not need for catch
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev };
        delete newState[itemKey];
        return newState;
      });
    }
  };

  const handleDecreaseQuantity = async (item) => {
    const itemKey = `${item._id}-${item.selectedVariant}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: "decreasing" }));

    try {
      await dispatch(
        decrementCartItemAsync({
          cartId,
          productId: item._id,
          variant: item.selectedVariant,
          currentQuantity: item.quantity, // Updated property name
        })
      ).unwrap();
      // Error handling is done in the thunk so no need for catch
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev };
        delete newState[itemKey];
        return newState;
      });
    }
  };

  const handleRemoveItem = async (item) => {
    const itemKey = `${item._id}-${item.selectedVariant}`;
    setLoadingItems((prev) => ({ ...prev, [itemKey]: "removing" }));

    try {
      await dispatch(
        removeFromCartAsync({
          cartId,
          productId: item._id,
          variant: item.selectedVariant,
          quantity: item.quantity, // Updated property name
        })
      ).unwrap();
      // Error handling is done in the thunk so no need for catch
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev };
        delete newState[itemKey];
        return newState;
      });
    }
  };

  // Render Component
  return (
    <>
      <div className="container mx-auto p-2 sm:p-4 md:p-8 mt-16">
        <div className="flex flex-col lg:flex-row bg-gradient-to-b bg-black rounded-xl shadow-lg overflow-hidden min-h-screen lg:min-h-0">
          {/* Left Section - Cart Items */}
          <div className="w-full lg:w-3/4 p-3 sm:p-4 md:p-8 flex flex-col max-h-[80vh] lg:max-h-[85vh]">
            {/* Cart Header */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white/90">
              Shopping Cart
            </h2>

            {/* Cart Summary & Continue Shopping */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/10 mb-4 sm:mb-6 pb-4">
              <span className="text-base sm:text-lg text-white/70 mb-2 sm:mb-0">
                Items: {cartItems.length}
              </span>
              <Link to="/shop">
                <span className="text-pink-500 hover:text-pink-400 transition-colors">
                  Continue Shopping
                </span>
              </Link>
            </div>

            {/* Empty Cart Message */}
            {cartItems.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-white/70 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-white/50 mb-6">
                  Add some items to get started!
                </p>
                <Link to="/shop">
                  <button className="px-6 py-3 bg-pink-500 text-black rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-white/10">
              {cartItems.map((item, index) => {
                const itemKey = `${item._id}-${item.selectedVariant}`;
                const isLoading = loadingItems[itemKey];

                return (
                  <div
                    key={index}
                    className="mb-4 sm:mb-6 bg-white/5 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 border border-white/10 last:mb-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Image Section */}
                      <div className="shrink-0 mx-auto sm:mx-0">
                        <img
                          src={`${item.image}`}
                          alt={item.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details Section */}
                      <div className="flex-grow space-y-2 sm:space-y-3 w-full">
                        <div className="flex flex-col w-full">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                            <h3 className="text-lg sm:text-xl font-medium text-white/90 hover:text-pink-500 transition-colors text-center sm:text-left">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 justify-center sm:justify-end">
                              <p className="text-base sm:text-lg font-bold text-white text-center sm:text-right">
                                <span className="text-black p-1 rounded-md font-bold text-xs bg-yellow-500">
                                  {item.price * item.quantity} ${" "}
                                  {/* Updated property name */}
                                </span>
                              </p>
                              <button
                                onClick={() => handleRemoveItem(item)}
                                disabled={isLoading === "removing"}
                                className="text-red-400 hover:text-red-300 p-1 transition-colors disabled:opacity-50"
                                title="Remove item"
                              >
                                {isLoading === "removing" ? "..." : "🗑️"}
                              </button>
                            </div>
                          </div>

                          {/* Variant Badge */}
                          {renderVariantBadge(item)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 justify-center sm:justify-start">
                          <span className="text-white/60 text-sm">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-black/40">
                            <button
                              className="cursor-pointer px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDecreaseQuantity(item)}
                              disabled={item.quantity <= 1 || isLoading} // Updated property name
                            >
                              {isLoading === "decreasing" ? "..." : "-"}
                            </button>
                            <span className="w-12 text-center text-white font-medium">
                              {item.quantity} {/* Updated property name */}
                            </span>
                            <button
                              className="cursor-pointer px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleIncreaseQuantity(item)}
                              disabled={isLoading}
                            >
                              {isLoading === "increasing" ? "..." : "+"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="w-full lg:w-1/4 bg-white/5 backdrop-blur-sm p-4 sm:p-6 lg:max-h-[85vh] lg:overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white/90">
              Order Summary
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-white/70">
                <span>Items ({cartItems.length})</span>
                <span>{subtotal} $</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>{SHIPPING_COST} $</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-col items-end">
                  {couponApplied && (
                    <div className="flex justify-between w-full text-white/50 text-sm">
                      <span>Original Total</span>
                      <span className="line-through">{originalPrice} $</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full text-yellow-500 font-bold">
                    <span>Total</span>
                    <span>{finalCost} $</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Section */}
            <div className="space-y-3 sm:space-y-4">
              {/* Coupon Section */}
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-pink-500/50 outline-none transition-colors text-sm sm:text-base"
              />
              <button
                className="w-full py-2 sm:py-3 rounded-lg bg-pink-500 cursor-pointer font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base"
                onClick={handleCouponCode}
              >
                Apply
              </button>

              {/* Delivery Address Section */}
              <input
                type="text"
                placeholder="Delivery Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-pink-500/50 outline-none transition-colors text-sm sm:text-base"
              />

              {/* Payment Method Section */}
              <div className="space-y-2">
                <p className="text-white/70 text-[10px]">
                  Select Payment Method
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setPaymentMethod((prev) => (prev === "cod" ? "" : "cod"))
                    }
                    className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer
                      ${
                        paymentMethod === "cod"
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                  >
                    <img
                      src={assets.cod}
                      className="w-10"
                      alt="Cash on Delivery"
                    />
                  </button>
                  <StripeButton />
                </div>
              </div>

              {/* Checkout Button */}
              {paymentMethod === "cod" && cartItems.length > 0 && (
                <button
                  className="w-full py-3 rounded-lg bg-pink-500 text-black cursor-pointer font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base mt-4"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
