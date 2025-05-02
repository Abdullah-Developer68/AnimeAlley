import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { increaseQuantity, decreaseQuantity } from "../redux/Slice/cartSlice";
import { useState, useEffect } from "react";
import api from "../api/api";

const Cart = () => {
  // Redux setup
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Constants
  const SHIPPING_COST = 99;

  // State management
  const [couponCode, setCouponCode] = useState("");
  const [finalCost, setFinalCost] = useState(
    localStorage.getItem("finalCost") || 0
  );
  const [couponApplied, setCouponApplied] = useState(
    localStorage.getItem("couponApplied") || false
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to Cash on Delivery

  // Price calculations
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.itemQuantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const originalCost = subtotal + SHIPPING_COST;
  let discountedPrice;

  // Update final cost when cart changes
  useEffect(() => {
    setFinalCost(originalCost);
  }, [originalCost]);

  // Coupon handling
  const handleCouponCode = async () => {
    if (couponApplied) {
      alert("Coupon already applied!");
      return;
    }

    if (!couponCode) {
      alert("Please enter a coupon code");
      return;
    }

    try {
      const response = await api.verifyCouponCode(couponCode.trim());
      const coupon = response.data?.coupon;

      if (coupon) {
        const discount = coupon.discountPercentage;
        discountedPrice = subtotal - (subtotal * discount) / 100;
        const newFinalCost = discountedPrice + SHIPPING_COST;

        // Update state and localStorage
        setFinalCost(newFinalCost);
        setCouponApplied(true);
        localStorage.setItem("finalCost", newFinalCost);
        localStorage.setItem("couponApplied", true);

        setTimeout(() => {
          alert(`Coupon applied! New total: Rs. ${newFinalCost}`);
        }, 500);
      } else {
        alert("Invalid coupon code");
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
      alert("Something went wrong while verifying the coupon.");
    }
  };

  // Order placement
  const handlePlaceOrder = () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter a delivery address");
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    api.placeOrder(
      cartItems,
      couponCode,
      subtotal,
      discountedPrice,
      SHIPPING_COST,
      finalCost,
      userInfo,
      deliveryAddress,
      paymentMethod
    );
    localStorage.setItem("couponApplied", false);
    localStorage.setItem("finalCost", 0);
    localStorage.setItem("cartItems", JSON.stringify([]));
    alert("Order placed successfully!");
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

  // Quantity handlers
  const handleIncreaseQuantity = (item) => {
    dispatch(
      increaseQuantity({
        id: item._id,
        selectedVariant: item.selectedVariant,
      })
    );
  };

  const handleDecreaseQuantity = (item) => {
    dispatch(
      decreaseQuantity({
        id: item._id,
        selectedVariant: item.selectedVariant,
      })
    );
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
                        src={item.image}
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
                            Rs. {item.price * item.itemQuantity}
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
                            className="cursor-pointer px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors"
                            onClick={() => handleDecreaseQuantity(item)}
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-white font-medium">
                            {item.itemQuantity}
                          </span>
                          <button
                            className="cursor-pointer px-4 py-2 text-white/90 hover:bg-pink-500/20 transition-colors"
                            onClick={() => handleIncreaseQuantity(item)}
                          >
                            +
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
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>Rs. {SHIPPING_COST}</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-yellow-500 font-bold">
                  <span>Total</span>
                  <span>Rs. {finalCost}</span>
                </div>
              </div>
            </div>

            {/* Checkout Section */}
            <div className="space-y-3 sm:space-y-4">
              {/* Coupon Section */}
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
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
                    onClick={() => setPaymentMethod("cod")}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer
                      ${
                        paymentMethod === "cod"
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 flex items-center justify-center gap-Î cursor-pointer
                      ${
                        paymentMethod === "online"
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                  >
                    Pay Online
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="w-full py-3 rounded-lg bg-pink-500 text-black cursor-pointer font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base mt-4"
                onClick={handlePlaceOrder}
              >
                {paymentMethod === "cod" ? "Place Order" : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
