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

// get all products from http://localhost:3000/product/getProducts?category=Electronics
api.getProducts = (category) =>
  api.get("/product/getProducts", { params: { category } });

export default api;
