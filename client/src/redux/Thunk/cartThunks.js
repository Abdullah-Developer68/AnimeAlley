import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { getOrCreateCartId } from "../../utils/cartId";
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
} from "../Slice/cartSlice";

// --- USED IN ProductDes.jsx ---

// Add to cart with stock reservation
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ product, variant, quantity }, { dispatch, rejectWithValue }) => {
    const cartId = getOrCreateCartId();
    try {
      const res = await api.reserveStock(
        cartId,
        product._id,
        variant,
        quantity
      );

      if (res.data.success) {
        dispatch(
          addToCart({
            ...product,
            selectedVariant: variant,
            itemQuantity: res.data.reservedQuantity || quantity, // Use actual reserved quantity
          })
        );
        // returns data and tells unwrap that thunk succeded
        return res.data;
      } else {
        // Handle different error types with stock info
        if (res.data.stock === -1) {
          return rejectWithValue({
            message: res.data.message,
            type: "CONCURRENT_MODIFICATION",
            stock: -1,
          });
        } else if (res.data.stock === 0) {
          return rejectWithValue({
            message: res.data.message,
            type: "OUT_OF_STOCK",
            stock: 0,
          });
        } else {
          return rejectWithValue({
            message: res.data.message || "Failed to reserve stock",
            type: "GENERAL_ERROR",
          });
        }
      }
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || "Server error",
        type: "NETWORK_ERROR",
      });
    }
  }
);

// --- USED IN Cart.jsx ---

// Increase/Decrease quantity with stock reservation/release
export const decrementReservationStockAsync = createAsyncThunk(
  "cart/decrementReservationStockAsync",
  async ({ id, variant }, { dispatch, getState, rejectWithValue }) => {
    const cartId = getOrCreateCartId();
    const item = getState().cart.cartItems.find(
      (i) => i._id === id && i.selectedVariant === variant
    );
    if (!item) return rejectWithValue("Item not found in cart");
    try {
      await api.decrementReservationStock(cartId, id, variant, 1);
      dispatch(decreaseQuantity({ id, selectedVariant: variant }));
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);

export const incrementReservationStockAsync = createAsyncThunk(
  "cart/incrementReservationStockAsync",
  async ({ id, variant }, { dispatch, getState, rejectWithValue }) => {
    const cartId = getOrCreateCartId();
    const item = getState().cart.cartItems.find(
      (i) => i._id === id && i.selectedVariant === variant
    );
    if (!item) return rejectWithValue("Item not found in cart");
    try {
      const res = await api.reserveStock(cartId, id, variant, 1);
      if (res.data.success) {
        dispatch(increaseQuantity({ id, selectedVariant: variant }));
        return true;
      } else {
        return rejectWithValue(res.data.message || "Failed to reserve stock");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  }
);
