import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminData: null,

  // ============================================================
  // DASHBOARD
  // ============================================================

  dashboardData: null,
  dashboardLoading: false,

  // ============================================================
  // RESTAURANTS
  // ============================================================

  restaurants: [],
  pendingRestaurants:[],
  suspendedRestaurants:[],
  restaurantsLoading: false,

  selectedRestaurant: null,

  // ============================================================
  // GENERAL
  // ============================================================

  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",

  initialState,

  reducers: {
    // ============================================================
    // ADMIN
    // ============================================================

    setAdminData: (state, action) => {
      state.adminData = action.payload;
    },

    clearAdminData: (state) => {
      state.adminData = null;
    },

    // ============================================================
    // DASHBOARD
    // ============================================================

    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },

    clearDashboardData: (state) => {
      state.dashboardData = null;
    },

    setDashboardLoading: (state, action) => {
      state.dashboardLoading = action.payload;
    },

    // ============================================================
    // RESTAURANTS
    // ============================================================

    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },
    setPendingRestaurants: (state, action) => {
      state.pendingRestaurants = action.payload;
    },
    setSuspendedRestaurants: (state, action) => {
      state.suspendedRestaurants = action.payload;
    },

    setRestaurantsLoading: (state, action) => {
      state.restaurantsLoading = action.payload;
    },

    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },

    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },

    // ============================================================
    // APPROVE RESTAURANT
    // ============================================================

    approveRestaurantInState: (state, action) => {
      const approvedRestaurant = action.payload;

      const restaurant = state.restaurants.find(
        (restaurant) =>
          restaurant.id === approvedRestaurant.id
      );

      if (restaurant) {
        restaurant.is_approved = true;
      }

      if (state.dashboardData?.restaurants) {
        state.dashboardData.restaurants.approved += 1;
        state.dashboardData.restaurants.pending -= 1;
      }
    },

    // ============================================================
    // GENERAL LOADING
    // ============================================================

    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },

    // ============================================================
    // ERROR
    // ============================================================

    setAdminError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAdminData,
  clearAdminData,

  setDashboardData,
  clearDashboardData,
  setDashboardLoading,

  setRestaurants,
  setPendingRestaurants,
  setSuspendedRestaurants,
  setRestaurantsLoading,
  setSelectedRestaurant,
  clearSelectedRestaurant,

  approveRestaurantInState,

  setAdminLoading,
  setAdminError,
} = adminSlice.actions;

export default adminSlice.reducer;