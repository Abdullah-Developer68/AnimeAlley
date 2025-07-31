import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  couponApplied: false,
  couponCode: "",
  finalCost: 0,
  isLoading: false,
  isCartLoaded: false, // Track if cart has been loaded from server
  // Coupon modal state
  couponModalOpen: false,
  pendingOrderData: null,
  // Checkout data
  deliveryAddress: localStorage.getItem("deliveryAddress") || "",
  paymentMethod: "",
  couponProceedData: null,
  // Server sync state
  isSyncing: false,
  lastSyncError: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Set cart items from server
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      state.isCartLoaded = true;
    },

    // Local cart operations (will trigger server sync)
    addToCartLocal: (state, action) => {
      const newItem = action.payload;
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
    },
    updateCartItemLocal: (state, action) => {
      const { id, selectedVariant, newQuantity } = action.payload;
      const item = state.cartItems.find(
        (item) => item._id === id && item.selectedVariant === selectedVariant
      );
      if (item) {
        if (newQuantity === 0) {
          state.cartItems = state.cartItems.filter(
            (item) =>
              !(item._id === id && item.selectedVariant === selectedVariant)
          );
        } else {
          item.itemQuantity = newQuantity;
        }
      }
    },

    removeFromCartLocal: (state, action) => {
      const { id, selectedVariant } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item._id === id && item.selectedVariant === selectedVariant)
      );
    },

    emptyCartLocal: (state) => {
      state.cartItems = [];
    },

    // Sync state management
    setSyncing: (state, action) => {
      state.isSyncing = action.payload;
    },

    setSyncError: (state, action) => {
      state.lastSyncError = action.payload;
    },
    // Keep existing coupon actions unchanged
    applyCoupon: (state, action) => {
      const { couponCode, finalCost } = action.payload;
      state.couponApplied = true;
      state.couponCode = couponCode;
      state.finalCost = finalCost;
    },

    resetCoupon: (state) => {
      state.couponApplied = false;
      state.couponCode = "";
      state.finalCost = 0;
    },

    setFinalCost: (state, action) => {
      state.finalCost = action.payload;
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Coupon modal actions
    openCouponModal: (state, action) => {
      state.couponModalOpen = true;
      state.pendingOrderData = action.payload || null;
    },
    closeCouponModal: (state) => {
      state.couponModalOpen = false;
      state.pendingOrderData = null;
    },
    // Checkout data actions
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
      localStorage.setItem("deliveryAddress", action.payload);
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    // Coupon modal proceed action - stores coupon data for order processing
    setCouponProceedData: (state, action) => {
      state.couponProceedData = action.payload;
    },
  },
});

export const {
  setCartItems,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  emptyCartLocal,
  setSyncing,
  setSyncError,
  applyCoupon,
  resetCoupon,
  setFinalCost,
  setCartLoading,
  openCouponModal,
  closeCouponModal,
  setDeliveryAddress,
  setPaymentMethod,
  setCouponProceedData,
} = cartSlice.actions;
export default cartSlice.reducer;
