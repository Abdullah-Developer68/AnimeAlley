import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./Slice/categorySlice";

const store = configureStore({
  reducer: {
    category: categoryReducer, // best practice is that Key should match the slice name in the reducer
  },
});

export default store;
