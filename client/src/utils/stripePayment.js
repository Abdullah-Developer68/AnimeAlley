import api from "../api/api";
import { getOrCreateCartId } from "./cartId";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Process Stripe payment with coupon data
 * @param {Object} couponData - Coupon information from modal
 * @param {string} deliveryAddress - Delivery address
 * @param {number} subtotal - Original subtotal
 * @param {number} shippingCost - Shipping cost
 */
export const processStripePayment = async (couponData, deliveryAddress, subtotal, shippingCost) => {
  try {
    const stripe = await stripePromise;
    
    const res = await api.createCheckOutSession(
      getOrCreateCartId(),
      couponData.couponCode,
      couponData.originalTotal,
      couponData.finalTotal,
      couponData.discountAmount,
      deliveryAddress,
      shippingCost
    );
    
    const { sessionId } = res.data;
    await stripe.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error("Error processing Stripe payment:", error);
    throw error;
  }
};
