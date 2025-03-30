import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currCategory: "All",
};

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    // Actions are written below. They are plain JavaScript objects that describe what should happen in the Redux store.
    //Every action has a type (a string) and optionally a payload (data needed for the action).
    //state is used to access the current value of the property in initailState and payload contains values that are passed to it
    setCategory: (state, action) => {
      state.currCategory = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function by redux toolkit
// Action creators are functions that create actions. They simply return an action object.
export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;
