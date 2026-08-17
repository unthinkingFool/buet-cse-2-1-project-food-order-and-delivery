import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assignedOrders: [],
  deliveredOrders: [],
};

const riderSlice = createSlice({
  name: "rider",
  initialState,

  reducers: {
    setAssignedOrders: (state, action) => {
      state.assignedOrders = action.payload;
    },

    setDeliveredOrders: (state, action) => {
      state.deliveredOrders = action.payload;
    },

    clearRiderOrders: (state) => {
      state.assignedOrders = [];
      state.deliveredOrders = [];
    },
  },
});

export const {
  setAssignedOrders,
  setDeliveredOrders,
  clearRiderOrders,
} = riderSlice.actions;

export default riderSlice.reducer;