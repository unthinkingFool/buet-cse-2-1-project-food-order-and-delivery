import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurantData: null,
  items: [],
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,

  reducers: {
    setRestaurantData: (state, action) => {
      state.restaurantData = action.payload;
    },

    setItems: (state, action) => {
      state.items = action.payload;
    },

    addItem: (state, action) => {
      state.items.push(action.payload);
    },

    updateItem: (state, action) => {
      const updatedItem = action.payload;

      const index = state.items.findIndex((item) => item.id === updatedItem.id);

      if (index !== -1) {
        state.items[index] = updatedItem;
      }
    },

    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setRestaurantStatus: (state, action) => {
      if (state.restaurantData?.restaurant) {
        state.restaurantData.restaurant.status = action.payload;
      }
    },
    updateItemAvailability: (state, action) => {
      const { itemId, isavailable } = action.payload;

      const item = state.items.find((item) => item.id === itemId);

      if (item) {
        item.isavailable = isavailable;
      }
    },
  },
});

export const {
  setRestaurantData,
  setItems,
  addItem,
  updateItem,
  deleteItem,
  setRestaurantStatus,
  updateItemAvailability
} = ownerSlice.actions;

export default ownerSlice.reducer;
