import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import UserHistory from "./pages/UserHistory";
import ProductDes from "./pages/ProductDes";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Global/Navbar";
import Footer from "./components/Global/Footer";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAndExpireCart } from "./redux/Slice/cartSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAndExpireCart());
  }, [dispatch]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDes />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <UserHistory />
                </ProtectedRoute>
              }
            />
            {/* Applying "*" after the link allows routes to work within that component */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
