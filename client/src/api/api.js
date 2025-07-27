import axios from "axios";

// Use development URL in dev mode, production URL in production mode
const isDevelopment = import.meta.env.MODE === "development";
const serverURL = isDevelopment
  ? "http://localhost:3000"
  : import.meta.env.VITE_API_BASE_URL;

// Token storage helper functions
const getStoredToken = () => {
  return localStorage.getItem("authToken");
};

const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

// axios automatically sets the headers content type for api requests
const api = axios.create({
  baseURL: `${serverURL}/api`,
  withCredentials: true, // tells the browser to send cookies, authorization headers or TLS client certificates when making a CORS.
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token from responses
api.interceptors.response.use(
  (response) => {
    // If response contains a token, store it
    if (response.data && response.data.token) {
      setStoredToken(response.data.token);
    }
    return response;
  },
  (error) => {
    // If 401 error, clear stored token
    if (error.response && error.response.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  }
);

// --- AUTH API'S ---

// GOOGLE AUTH
api.googleLogin = () => {
  window.location.href = `${serverURL}/api/googleAuth/login`;
};
api.googleLogout = () => {
  window.location.href = `${serverURL}/api/googleAuth/logout`;
};
// login with email and password credentials
api.login = (loginData) => {
  return api.post("/auth/login", loginData);
};
// verifies JWT tokens for both local and google auth
api.verifyAuth = () => {
  return api.get("/auth/verify");
};
// used in auth provider to check if user is logged in with google
api.googleAuthSuccess = () => {
  return api.get("/googleAuth/success");
};

api.logout = () => {
  // Clear stored token on logout
  setStoredToken(null);
  return api.get("/auth/logout");
};

// --- PRODUCT API'S ---

api.createProduct = (productData) => {
  return api.post("/product/createProduct", productData);
};

api.getProducts = (productConstraints) => {
  return api.get("/product/getProducts", {
    params: {
      productConstraints: JSON.stringify(productConstraints),
    },
  });
};
api.deleteProduct = (productID) => {
  return api.post("/product/deleteProduct", { productID });
};
api.updateProduct = (productData) => {
  return api.put("/product/updateProduct", productData);
};

api.searchProduct = (data) => {
  return api.get("/search/products", { params: { data } });
};

api.verifyStock = (itemName, selectedVariant, itemQuantity) => {
  return api.get("/product/verifyStock", {
    params: { itemName, selectedVariant, itemQuantity },
  });
};

// --- ORDER API'S ---

api.placeOrder = (
  couponCode,
  subtotal,
  discountedPrice,
  SHIPPING_COST,
  finalCost,
  userInfo,
  deliveryAddress,
  paymentMethod,
  cartId
) => {
  return api.post("/order/placeOrder", {
    couponCode,
    subtotal,
    discountedPrice,
    shippingCost: SHIPPING_COST,
    finalCost,
    userInfo,
    deliveryAddress,
    paymentMethod,
    cartId,
  });
};

api.getAllOrdersList = (email, currPage) => {
  return api.get("/order/allOrdersList", {
    params: {
      email,
      currPage,
    },
  });
};

api.updateOrder = (orderId, orderData) => {
  return api.put(`/order/update/${orderId}`, orderData);
};

api.deleteOrder = (orderId) => {
  return api.delete(`/order/delete/${orderId}`);
};

api.getOrderHistory = (userInfo, currPage) => {
  return api.get("/order/getOrders", {
    params: {
      email: userInfo.email,
      currPage,
    },
  });
};

// --- USER API'S ---

api.updateUser = (userId, userData) => {
  const formData = new FormData();
  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.put(`/user/update/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

api.deleteUser = (userId, editorEmail) => {
  return api.delete(`/user/delete/${userId}`, {
    data: { editorEmail },
  });
};

api.getUsers = (viewerEmail, currPage, searchQuery, role) => {
  return api.get("/user/getUsers", {
    params: {
      viewerEmail,
      currPage,
      searchQuery,
      role,
    },
  });
};

// --- COUPON API'S ---

api.createCoupon = (couponData) => {
  return api.post("/coupon/createCoupon", couponData);
};

api.updateCoupon = (couponId, couponData) => {
  return api.put(`/coupon/update/${couponId}`, couponData);
};

api.getAllCoupons = (email, currPage) => {
  return api.get("/coupon/allCoupons", {
    params: {
      email,
      currPage,
    },
  });
};

api.deleteCoupon = (couponId) => {
  return api.delete(`/coupon/delete/${couponId}`);
};

api.getCouponStats = (email) => {
  return api.get("/coupon/stats", { params: { email } });
};

api.verifyCouponCode = (couponCode, userEmail) => {
  return api.post("/coupon/verify", { couponCode, userEmail });
};

// --- EXPORT API ---

api.exportData = (dataType, email, format) => {
  return api.get(`/export/${dataType}`, {
    params: {
      email,
      format,
    },
    responseType: "blob", // Important for handling file downloads
  });
};

// --- API'S FOR STOCK MANAGEMENT
api.reserveStock = (cartId, productId, variant, quantity) => {
  return api.post("/reserveStock", { cartId, productId, variant, quantity });
};

api.decrementReservationStock = (cartId, productId, variant, quantity) => {
  return api.post("/decrementReservationStock", {
    cartId,
    productId,
    variant,
    quantity,
  });
};

// --- STRIPE API ---
api.createCheckOutSession = (
  cartId,
  couponCode,
  userEmail,
  originalTotal,
  finalTotal,
  discountAmount,
  deliveryAddress,
  shippingCost
) => {
  return api.post("/stripe/create-checkout-session", {
    cartId,
    couponCode,
    userEmail,
    originalTotal,
    finalTotal,
    discountAmount,
    deliveryAddress,
    shippingCost,
  });
};
// Export token management functions for use in components
export { getStoredToken, setStoredToken };
export default api;
