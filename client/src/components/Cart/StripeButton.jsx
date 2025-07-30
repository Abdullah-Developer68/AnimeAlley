import { useSelector, useDispatch } from "react-redux";
import { openCouponModal } from "../../redux/Slice/cartSlice";
import { toast } from "react-toastify";

const StripeButton = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const deliveryAddress = useSelector((state) => state.cart.deliveryAddress);

  // Calculate original price (subtotal + shipping)
  const shippingCost = 5;
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.itemQuantity,
    0
  );

  const handleClick = () => {
    if (!deliveryAddress?.trim()) {
      toast.error("Enter the delivery address!");
      return;
    }

    // Open coupon modal with Stripe payment method
    dispatch(
      openCouponModal({
        deliveryAddress,
        paymentMethod: "stripe",
        subtotal,
        shippingCost,
      })
    );
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer
        bg-white/10 text-white/70 hover:bg-white/20"
    >
      Online Payment
    </button>
  );
};

export default StripeButton;
