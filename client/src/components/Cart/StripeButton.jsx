import api from "../../api/api";
import { getOrCreateCartId } from "../../utils/cartId";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import assets from "../../assets/asset";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeButton = () => {
  // Get required data from Redux store
  const couponCode = useSelector((state) => state.cart.couponCode);
  const finalCost = useSelector((state) => state.cart.finalCost);
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Calculate original price (subtotal + shipping)
  const SHIPPING_COST = 99;
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.itemQuantity,
    0
  );
  const originalTotal = subtotal + SHIPPING_COST;
  const discountAmount = originalTotal - finalCost;

  // Get user info and delivery address from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const deliveryAddress = localStorage.getItem("deliveryAddress") || "";
  console.log("Delivery address being sent to backend:", deliveryAddress);
  const handleClick = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Enter the delivery address!");
      return;
    }
    const stripe = await stripePromise;
    try {
      const res = await api.createCheckOutSession(
        getOrCreateCartId(),
        couponCode,
        userInfo?.email,
        originalTotal,
        finalCost,
        discountAmount,
        deliveryAddress
      );
      const { sessionId } = res.data;

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error loading Stripe:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer
        bg-white/10 text-white/70 hover:bg-white/20"
    >
      <img src={assets.creditCard} className="w-16" />
    </button>
  );
};

export default StripeButton;
