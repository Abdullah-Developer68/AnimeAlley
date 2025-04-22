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
api.getProducts = (category, productConstraints, currPage) =>
  api.post("/product/getProducts", { category, productConstraints, currPage });

api.placeOrder = (data) => {
  api.post("/order/placeOrder", { data });
};

export default api;
