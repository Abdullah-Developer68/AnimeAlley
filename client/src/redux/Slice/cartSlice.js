import { createSlice } from "@reduxjs/toolkit";

const CART_EXPIRY_DAYS = 2;

// Set amount of time to expires the cart
function isCartExpired() {
  const cartTimestamp = localStorage.getItem("cartTimestamp");
  if (!cartTimestamp) return false;
  const now = Date.now();
  return (
    now - parseInt(cartTimestamp, 10) > CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );
}

// gives timeStamp to a cart
function setCartTimestamp() {
  localStorage.setItem("cartTimestamp", Date.now().toString());
}

const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  couponApplied:
    localStorage.getItem("couponApplied") === "true" ? true : false,
  couponCode: localStorage.getItem("couponCode") || "",
  finalCost: localStorage.getItem("finalCost")
    ? Number(localStorage.getItem("finalCost"))
    : 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      setCartTimestamp();
      // Reserve stock before adding (async logic should be handled in thunk)
      const existingItem = state.cartItems.find(
        (item) =>
          item._id === newItem._id &&
          item.selectedVariant === newItem.selectedVariant
      );

      if (existingItem) {
        existingItem.itemQuantity += newItem.itemQuantity;
      } else {
        state.cartItems.push(newItem);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    increaseQuantity: (state, action) => {
      const { id, selectedVariant, newQuantity } = action.payload;
      const item = state.cartItems.find(
        (item) => item._id === id && item.selectedVariant === selectedVariant
      );
      if (item) {
        if (newQuantity !== undefined) {
          item.itemQuantity = newQuantity;
        } else {
          item.itemQuantity += 1;
        }
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
      } else if (item && item.itemQuantity === 1) {
        state.cartItems = state.cartItems.filter(
          (item) =>
            !(item._id === id && item.selectedVariant === selectedVariant)
        );
      } else if (item && item.itemQuantity === 0) {
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
      // Release stock before removing (async logic should be handled in thunk)
      state.cartItems = state.cartItems.filter(
        (item) => !(item._id === id && item.selectedVariant === selectedVariant)
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    emptyCart: (state) => {
      // Release stock for all items (async logic should be handled in thunk)
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify([]));
    },
    applyCoupon: (state, action) => {
      const { couponCode, finalCost } = action.payload;
      state.couponApplied = true;
      state.couponCode = couponCode;
      state.finalCost = finalCost;

      localStorage.setItem("couponApplied", "true");
      localStorage.setItem("couponCode", couponCode);
      localStorage.setItem("finalCost", finalCost.toString());
    },

    resetCoupon: (state) => {
      state.couponApplied = false;
      state.couponCode = "";
      state.finalCost = 0;

      localStorage.setItem("couponApplied", "false");
      localStorage.setItem("couponCode", "");
      localStorage.setItem("finalCost", "0");
    },
    setFinalCost: (state, action) => {
      state.finalCost = action.payload;
      localStorage.setItem("finalCost", action.payload.toString());
    },
    checkAndExpireCart: (state) => {
      if (isCartExpired()) {
        // Release stock for all items (async logic should be handled in thunk)
        state.cartItems = [];
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.removeItem("cartTimestamp");
      }
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  emptyCart,
  applyCoupon,
  resetCoupon,
  setFinalCost,
  checkAndExpireCart,
} = cartSlice.actions;
export default cartSlice.reducer;
