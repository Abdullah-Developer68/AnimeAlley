import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./Slice/shopSlice";

const store = configureStore({
  reducer: {
    shop: shopReducer, // best practice is that Key should match the slice name in the reducer
  },
});

export default store;
