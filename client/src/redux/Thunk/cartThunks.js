import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { getOrCreateCartId } from "../../utils/cartId";
import {
  setCartItems,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  emptyCartLocal,
} from "../Slice/cartSlice";

// Load cart from server
export const loadCartFromServer = createAsyncThunk(
  "cart/loadFromServer",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Get user info to send userId
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo || !userInfo.id) {
        return rejectWithValue("User not logged in");
      }

      const response = await api.getCart(userInfo.id);

      if (response.data.success) {
        dispatch(setCartItems(response.data.cartItems));
        return response.data.cartItems;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load cart";
      return rejectWithValue(errorMessage);
    }
  }
);

// Add to cart with server sync
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ product, variant, quantity }, { dispatch, rejectWithValue }) => {
    try {
      // Get user info and cartId
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const cartId = getOrCreateCartId();

      const res = await api.reserveStock(
        cartId,
        product._id,
        variant,
        quantity,
        userInfo?.id // Send userId from frontend
      );

      if (res.data.success) {
        dispatch(
          addToCartLocal({
            ...product,
            selectedVariant: variant,
            itemQuantity: res.data.reservedQuantity || quantity,
          })
        );
        return res.data;
      } else {
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
            message: res.data.message || "Failed to add to cart",
            type: "GENERAL_ERROR",
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add to cart";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update cart item quantity
export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItemAsync",
  async ({ id, variant, newQuantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.updateCartItem(id, variant, newQuantity);

      if (response.data.success) {
        dispatch(
          updateCartItemLocal({ id, selectedVariant: variant, newQuantity })
        );
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update cart";
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove from cart
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async ({ id, variant }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.removeFromCart(id, variant);

      if (response.data.success) {
        dispatch(removeFromCartLocal({ id, selectedVariant: variant }));
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove from cart";
      return rejectWithValue(errorMessage);
    }
  }
);

// Clear cart
export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.clearCart();

      if (response.data.success) {
        dispatch(emptyCartLocal());
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear cart";
      return rejectWithValue(errorMessage);
    }
  }
);

// Legacy thunks for backward compatibility
export const decrementReservationStockAsync = createAsyncThunk(
  "cart/decrementReservationStockAsync",
  async ({ id, variant }, { dispatch, getState, rejectWithValue }) => {
    const item = getState().cart.cartItems.find(
      (i) => i._id === id && i.selectedVariant === variant
    );
    if (!item) return rejectWithValue("Item not found in cart");

    const newQuantity = Math.max(0, item.itemQuantity - 1);
    return dispatch(updateCartItemAsync({ id, variant, newQuantity }));
  }
);

export const incrementReservationStockAsync = createAsyncThunk(
  "cart/incrementReservationStockAsync",
  async ({ id, variant }, { dispatch, getState, rejectWithValue }) => {
    const item = getState().cart.cartItems.find(
      (i) => i._id === id && i.selectedVariant === variant
    );
    if (!item) return rejectWithValue("Item not found in cart");

    const newQuantity = item.itemQuantity + 1;
    return dispatch(updateCartItemAsync({ id, variant, newQuantity }));
  }
);
