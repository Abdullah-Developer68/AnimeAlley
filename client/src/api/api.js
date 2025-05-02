import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add specific method for Google auth
api.googleLogin = () => {
  window.location.href = "http://localhost:3000/googleAuth/login";
};

// Changed to POST request for getting products
api.getProducts = (category, productConstraints, currPage) => {
  return api.post("/product/getProducts", {
    category,
    productConstraints,
    currPage,
  });
};

api.placeOrder = (
  cartItems,
  couponCode,
  subtotal,
  discountedPrice,
  SHIPPING_COST,
  finalCost,
  userInfo,
  deliveryAddress,
  paymentMethod
) => {
  return api.post("/order/placeOrder", {
    cartItems,
    couponCode,
    subtotal,
    discountedPrice,
    SHIPPING_COST,
    finalCost,
    userInfo,
    deliveryAddress,
    paymentMethod,
  });
};

api.verifyCouponCode = (couponCode) => {
  return api.post("/coupon/verify", { couponCode });
};

export default api;
