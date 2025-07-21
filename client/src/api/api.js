import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints
export const login = (userData) => api.post("/auth/login", userData);
export const signup = (userData) => api.post("/auth/signup", userData);
export const logout = () => api.post("/auth/logout");

// Product endpoints
export const getProducts = () => api.get("/product/getProducts");
export const findProducts = (searchQuery) =>
  api.get(`/product/findProducts?searchQuery=${searchQuery}`);
export const createProduct = (productData) =>
  api.post("/product/createProduct", productData);
export const verifyStock = (stockData) =>
  api.post("/product/verifyStock", stockData);
export const updateProduct = (productData) =>
  api.put("/product/updateProduct", productData);
export const deleteProduct = (productId) =>
  api.delete(`/product/deleteProduct/${productId}`);

// Reservation endpoints (Updated with verification)
export const reserveStock = (reservationData) =>
  api.post("/reservation/reserveStock", reservationData);
export const releaseStock = (releaseData) =>
  api.post("/reservation/releaseStock", releaseData);
export const decrementReservationStock = (decrementData) =>
  api.post("/reservation/decrementReservationStock", decrementData);
export const incrementReservationStock = (incrementData) =>
  api.post("/reservation/incrementReservationStock", incrementData);
export const verifyReservation = (cartId) =>
  api.get(`/reservation/verify/${cartId}`);

// Order endpoints
export const placeOrder = (orderData) =>
  api.post("/order/placeOrder", orderData);
export const getOrderHistory = (userId) =>
  api.get(`/order/getOrderHistory/${userId}`);
export const allOrdersList = () => api.get("/order/allOrdersList");
export const deleteOrder = (orderId) =>
  api.delete(`/order/deleteOrder/${orderId}`);
export const updateOrder = (updateData) =>
  api.put("/order/updateOrder", updateData);
export const getOrderStats = () => api.get("/order/getOrderStats");

// User endpoints
export const getUserDetails = (email) =>
  api.get(`/user/getUserDetails/${email}`);
export const getAllUsers = () => api.get("/user/getAllUsers");
export const deleteUser = (userId) => api.delete(`/user/deleteUser/${userId}`);
export const updateUser = (updateData) =>
  api.put("/user/updateUser", updateData);

// Coupon endpoints
export const verifyCoupon = (couponData) =>
  api.post("/coupon/verifyCoupon", couponData);
export const createCoupon = (couponData) =>
  api.post("/coupon/createCoupon", couponData);
export const getAllCoupons = () => api.get("/coupon/getAllCoupons");
export const deleteCoupon = (couponId) =>
  api.delete(`/coupon/deleteCoupon/${couponId}`);

// Stripe endpoints
export const createCheckoutSession = (checkoutData) =>
  api.post("/stripe/createCheckoutSession", checkoutData);

export default api;
