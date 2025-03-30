import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import UserHistory from "./pages/UserHistory";
import ProductDes from "./components/Shop/ProductDes";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
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
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop/:id"
        element={
          <ProtectedRoute>
            <ProductDes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <UserHistory />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
