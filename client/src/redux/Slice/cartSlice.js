import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      // Check if item exists with same ID AND same variant
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === newItem._id &&
          item.selectedVariant === newItem.selectedVariant
      );

      if (existingItem) {
        // If exact same item (same ID and variant) exists, increase quantity
        existingItem.itemQuantity += newItem.itemQuantity;
      } else {
        // If item with different variant or new item, add as new entry
        state.cartItems.push(newItem);
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    increaseQuantity: (state, action) => {
      const { id, selectedVariant } = action.payload;
      const item = state.cartItems.find(
        (item) => item._id === id && item.selectedVariant === selectedVariant
      );
      if (item) {
        item.itemQuantity += 1;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    decreaseQuantity: (state, action) => {
      const { id, selectedVariant } = action.payload;
      const item = state.cartItems.find(
        (item) => item._id === id && item.selectedVariant === selectedVariant
      );
      if (item && item.itemQuantity > 1) {
        item.itemQuantity -= 1;
      }
      // If quantity is 1 and user tries to decrease, remove item from cart
      else if (item && item.itemQuantity === 1) {
        state.cartItems = state.cartItems.filter(
          (item) =>
            !(item._id === id && item.selectedVariant === selectedVariant)
        );
      }
      // If quantity is 0, remove item from cart
      else if (item && item.itemQuantity === 0) {
        state.cartItems = state.cartItems.filter(
          (cartItem) =>
            !(
              cartItem._id === id &&
              cartItem.selectedVariant === selectedVariant
            )
        );
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const { id, selectedVariant } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item._id === id && item.selectedVariant === selectedVariant)
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart } =
  cartSlice.actions;
export default cartSlice.reducer;
