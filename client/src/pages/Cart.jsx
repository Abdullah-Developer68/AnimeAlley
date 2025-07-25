import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  emptyCart,
  applyCoupon,
  resetCoupon,
  setFinalCost,
  setCartLoading,
} from "../redux/Slice/cartSlice";
import {
  decrementReservationStockAsync,
  incrementReservationStockAsync,
} from "../redux/Thunk/cartThunks";
import { getOrCreateCartId } from "../utils/cartId";
import StripeButton from "../components/Cart/StripeButton";
import { useState, useEffect } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import Loader from "../components/Global/Loader";

const Cart = () => {
  // Redux setup
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const couponApplied = useSelector((state) => state.cart.couponApplied);
  const couponCode = useSelector((state) => state.cart.couponCode);
  const finalCost = useSelector((state) => state.cart.finalCost);
  const isLoading = useSelector((state) => state.cart.isLoading);

  // Constants
  const SHIPPING_COST = 5;

  // State management
  const [deliveryAddress, setDeliveryAddress] = useState(
    localStorage.getItem("deliveryAddress")
      ? localStorage.getItem("deliveryAddress")
      : ""
  );
  const [paymentMethod, setPaymentMethod] = useState(""); // Default to Cash on Delivery
  const [couponInput, setCouponInput] = useState(""); // Local state for coupon input
  const [couponDiscount, setCouponDiscount] = useState(0); // Store coupon discount percentage
  const [originalPrice, setOriginalPrice] = useState(0); // Store original price before discount
  const [loadingItems, setLoadingItems] = useState(new Set()); // Track which items are being updated

  // Price calculations
  const calculateSubtotal = () => {
    return Math.round(
      cartItems.reduce(
        (total, item) => total + item.price * item.itemQuantity,
        0
      )
    );
  };

  const subtotal = calculateSubtotal();

  // Update final cost when cart or coupon changes
  useEffect(() => {
    if (cartItems.length === 0) {
      dispatch(resetCoupon());
      setCouponDiscount(0);
      setOriginalPrice(0);
      return;
    }

    const totalBeforeDiscount = subtotal + SHIPPING_COST;
    setOriginalPrice(totalBeforeDiscount);

    if (!couponApplied || couponDiscount === 0) {
      // No coupon: final cost is subtotal + shipping
      dispatch(resetCoupon());
      dispatch(setFinalCost(totalBeforeDiscount));
    } else {
      // Coupon applied: use stored discount percentage
      const discountedPrice = Math.round(subtotal * (1 - couponDiscount / 100));
      const newFinalCost = Math.round(discountedPrice + SHIPPING_COST);
      dispatch(
        applyCoupon({
          couponCode: couponCode,
          discountedPrice,
          finalCost: newFinalCost,
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
      // Set loading state with a small delay to prevent flickering for fast API calls
      const loadingTimer = setTimeout(() => {
        dispatch(setCartLoading(true));
      }, 200);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) {
        clearTimeout(loadingTimer);
        dispatch(setCartLoading(false));
        toast.error("Please login to apply coupon");
        return;
      }

      const response = await api.verifyCouponCode(
        couponInput.trim(),
        subtotal,
        userInfo.email
      );

      // Clear the loading timer since API call completed
      clearTimeout(loadingTimer);
      dispatch(setCartLoading(false));

      if (response.success === false) {
        toast.error("Invalid coupon code");
        return;
      }

      const coupon = response.data?.coupondata.coupon;

      if (coupon) {
        const discount = coupon.discountPercentage;
        setCouponDiscount(discount); // Store discount percentage in state
        const discountedPrice = Math.round(subtotal * (1 - discount / 100));
        const newFinalCost = Math.round(discountedPrice + SHIPPING_COST);

        dispatch(
          applyCoupon({
            couponCode: couponInput.trim(),
            discountedPrice,
            finalCost: newFinalCost,
          })
        );

        setTimeout(() => {
          toast.success(`Coupon applied! New total: ${newFinalCost} $`);
        }, 500);
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      dispatch(setCartLoading(false));
      toast.error(error.response?.data?.message || "Error applying coupon");
    }
  };

  // Order placement
  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    try {
      // Set loading state with a small delay to prevent flickering for fast API calls
      const loadingTimer = setTimeout(() => {
        dispatch(setCartLoading(true));
      }, 200);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // Calculate discounted price - if coupon applied, use the discounted subtotal, otherwise use original subtotal
      const discountedPrice = couponApplied
        ? subtotal * (1 - couponDiscount / 100)
        : subtotal;

      const res = await api.placeOrder(
        cartItems,
        couponCode,
        subtotal,
        discountedPrice,
        SHIPPING_COST,
        finalCost,
        userInfo,
        deliveryAddress,
        paymentMethod,
        getOrCreateCartId() // gets or creates a cart ID
      );

      // Clear the loading timer since API call completed
      clearTimeout(loadingTimer);
      dispatch(setCartLoading(false));

      if (res.data.success) {
        toast.success("Order placed successfully!");
        // Reset states
        dispatch(emptyCart());
        dispatch(resetCoupon());
        setPaymentMethod("cod");
      } else {
        toast.error(res.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      dispatch(setCartLoading(false));
      toast.error(error.response?.data?.message || "Something went wrong");
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

  // Quantity handlers with debouncing and loading states
  const handleIncreaseQuantity = async (item) => {
    const itemKey = `${item._id}-${item.selectedVariant}`;

    // Prevent multiple simultaneous requests for the same item
    if (loadingItems.has(itemKey)) {
      return;
    }

    // Add item to loading state
    setLoadingItems((prev) => new Set([...prev, itemKey]));

    try {
      await dispatch(
        incrementReservationStockAsync({
          id: item._id,
          variant: item.selectedVariant,
        })
      ).unwrap();
    } catch (err) {
      toast.error(err);
    } finally {
      // Remove item from loading state after request completes
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleDecreaseQuantity = async (item) => {
    const itemKey = `${item._id}-${item.selectedVariant}`;

    // Prevent multiple simultaneous requests for the same item
    if (loadingItems.has(itemKey)) {
      return;
    }

    // Add item to loading state
    setLoadingItems((prev) => new Set([...prev, itemKey]));

    try {
      await dispatch(
        decrementReservationStockAsync({
          id: item._id,
          variant: item.selectedVariant,
        })
      ).unwrap();
    } catch (err) {
      toast.error(err);
    } finally {
      // Remove item from loading state after request completes
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Render Component
  return (
    <>
      <div className="container mx-auto p-2 sm:p-4 md:p-8 mt-16">
        <div className="flex flex-col lg:flex-row bg-gradient-to-b bg-black rounded-xl shadow-lg overflow-hidden min-h-screen lg:min-h-0 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <Loader size="lg" />
            </div>
          )}

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

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-white/10">
              {cartItems.map((item, index) => (
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
                          <p className="text-base sm:text-lg font-bold text-white text-center sm:text-right">
                            <span className="text-black p-1 rounded-md font-bold text-xs bg-yellow-500">
                              {item.price * item.itemQuantity} $
                            </span>
                          </p>
                        </div>

                        {/* Variant Badge - Moved inside the flex-col container */}
                        {renderVariantBadge(item)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 justify-center sm:justify-start">
                        <span className="text-white/60 text-sm">Quantity:</span>
                        <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-black/40">
                          <button
                            className={`px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors ${
                              loadingItems.has(
                                `${item._id}-${item.selectedVariant}`
                              )
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={() => handleDecreaseQuantity(item)}
                            disabled={loadingItems.has(
                              `${item._id}-${item.selectedVariant}`
                            )}
                          >
                            {loadingItems.has(
                              `${item._id}-${item.selectedVariant}`
                            )
                              ? "..."
                              : "-"}
                          </button>
                          <span className="w-12 text-center text-white font-medium">
                            {item.itemQuantity}
                          </span>
                          <button
                            className={`px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors ${
                              loadingItems.has(
                                `${item._id}-${item.selectedVariant}`
                              )
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={() => handleIncreaseQuantity(item)}
                            disabled={loadingItems.has(
                              `${item._id}-${item.selectedVariant}`
                            )}
                          >
                            {loadingItems.has(
                              `${item._id}-${item.selectedVariant}`
                            )
                              ? "..."
                              : "+"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                    Cash on Delivery
                  </button>
                  <StripeButton />
                </div>
              </div>

              {/* Checkout Button */}
              {paymentMethod === "cod" && (
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
