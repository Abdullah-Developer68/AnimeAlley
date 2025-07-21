import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// Add item to cart with partial reservation handling
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (
    { cartId, productId, variant, requestedQuantity, productData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/reservation/reserveStock", {
        cartId,
        productId,
        variant,
        requestedQuantity,
      });

      if (response.data.success) {
        const { reservedQuantity, isPartial, availableStock } = response.data;

        // Handle partial reservation scenario
        if (isPartial) {
          const userConfirmed = await new Promise((resolve) => {
            toast.info(
              `Only ${reservedQuantity} out of ${requestedQuantity} items available. ${reservedQuantity} have been reserved. Continue?`,
              {
                onClose: () => resolve(false),
                onClick: () => resolve(true),
                autoClose: false,
              }
            );
          });

          if (!userConfirmed) {
            // Release the reserved stock if user doesn't confirm
            await api.post("/reservation/releaseStock", {
              cartId,
              productId,
              variant,
              quantity: reservedQuantity,
            });
            return rejectWithValue("User cancelled partial reservation");
          }
        }

        // Return data for cart state update
        return {
          cartId,
          productId,
          variant,
          quantity: reservedQuantity,
          productData,
          isPartial,
          message: isPartial
            ? `${reservedQuantity} items added to cart (partial quantity)`
            : `${reservedQuantity} items added to cart`,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Increment cart item quantity with atomic reservation
export const incrementCartItemAsync = createAsyncThunk(
  "cart/incrementCartItemAsync",
  async ({ cartId, productId, variant }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/reservation/incrementReservationStock",
        {
          cartId,
          productId,
          variant,
        }
      );

      if (response.data.success) {
        return {
          cartId,
          productId,
          variant,
          newQuantity: response.data.newQuantity,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cannot increase quantity";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Decrement cart item quantity with atomic stock restoration
export const decrementCartItemAsync = createAsyncThunk(
  "cart/decrementCartItemAsync",
  async (
    { cartId, productId, variant, currentQuantity },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        "/reservation/decrementReservationStock",
        {
          cartId,
          productId,
          variant,
          quantity: 1, // Always decrement by 1
        }
      );

      if (response.data.success) {
        return {
          cartId,
          productId,
          variant,
          newQuantity: currentQuantity - 1,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to decrease quantity";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove item from cart completely
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCartAsync",
  async ({ cartId, productId, variant, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post("/reservation/releaseStock", {
        cartId,
        productId,
        variant,
        quantity,
      });

      if (response.data.success) {
        return {
          cartId,
          productId,
          variant,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove item";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Clear entire cart
export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async ({ cartItems, cartId }, { rejectWithValue }) => {
    try {
      // Release all reserved stock
      const releasePromises = cartItems.map((item) =>
        api.post("/reservation/releaseStock", {
          cartId,
          productId: item._id,
          variant: item.selectedVariant,
          quantity: item.quantity,
        })
      );

      await Promise.all(releasePromises);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear cart";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Verify cart before checkout
export const verifyCartBeforeCheckoutAsync = createAsyncThunk(
  "cart/verifyCartBeforeCheckoutAsync",
  async ({ cartItems, cartId }, { rejectWithValue }) => {
    try {
      // Check if reservation still exists and is valid using the new API function
      const response = await api.get(`/reservation/verify/${cartId}`);

      if (!response.data.success) {
        toast.error("Cart has expired. Please add items again.");
        return rejectWithValue("Cart expired");
      }

      return {
        success: true,
        message: "Cart verified successfully",
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cart verification failed";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
