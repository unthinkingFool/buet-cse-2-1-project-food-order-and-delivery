import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    city: null,
    address: null,
    shopsInMyCity: [],
    itemsInMyCity: [],
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopsInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      //console.log(state.cartItems);
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },
    deleteCartItem: (state, action) => {
      const id = action.payload;

      state.cartItems = state.cartItems.filter((item) => item.id != id);

      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },
    updateorderStatus: (state, action) => {
      const { shopOrderId, status } = action.payload;

      for (const order of state.myOrders) {
        const shopOrder = order.shopOrders?.find(
          (shop) => shop.id === shopOrderId,
        );

        if (shopOrder) {
          shopOrder.status = status;
          shopOrder.updated_at = new Date().toISOString();
          break;
        }
      }
    },
  },
});

export const {
  setUserData,
  setCity,
  setAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  deleteCartItem,
  clearCart,
  setMyOrders,
  addMyOrder,
  updateorderStatus
} = userSlice.actions;
export default userSlice.reducer;
