import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import SignUp from "./pages/signup";
import SignIn from "./pages/signin";
import ForgotPassword from "./pages/ForgotPassword";

import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyRestaurant from "./hooks/useGetMyRestaurant";
import useGetRestaurantByCity from "./hooks/useGetRestaurantByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";

import { useSelector } from "react-redux";

import Home from "./pages/Home";
import CreateEditRestaurant from "./pages/CreateEditRestaurant";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import RiderDeliveredOrders from "./pages/RiderDeliveredOrders";
import OwnerDeliveredOrders from "./pages/OwnerDeliveredOrders";
import CustomerReceivedOrders from "./pages/CustomerReceivedOrders";
import RestaurantCard from "./components/RestaurantCard";
import TrackOrder from "./pages/TrackOrder";

// ============================================================
// ADMIN
// ============================================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminIssues from "./pages/admin/AdminIssues";

import AdminLayout from "./components/admin/AdminLayout";

import useGetCurrentAdmin from "./hooks/admin/useGetCurrentAdmin";

export const serverUrl = "http://localhost:3000";

function App() {
  const location = useLocation();

  useGetCurrentUser();
  useGetCity();
  useGetMyRestaurant();
  useGetRestaurantByCity();
  useGetItemsByCity();
  useGetMyOrders();

  // Only authentication/session check globally
  useGetCurrentAdmin();

  const { userData, cartItems } = useSelector((state) => state.user);

  const { adminData } = useSelector((state) => state.admin);

  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      {/* ====================================================== */}
      {/* USER ROUTES */}
      {/* ====================================================== */}

      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />

      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />

      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
      />

      <Route
        path="/create-edit-restaurant"
        element={
          userData ? <CreateEditRestaurant /> : <Navigate to="/signin" />
        }
      />

      <Route
        path="/add-food"
        element={userData ? <AddItem /> : <Navigate to="/signin" />}
      />

      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" />}
      />

      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" />}
      />

      <Route
        path="/checkout"
        element={
          userData && cartItems?.length > 0 ? (
            <CheckOut />
          ) : (
            <Navigate to={userData ? "/cart" : "/signin"} replace />
          )
        }
      />

      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to="/signin" replace />}
      />

      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to="/signin" />}
      />

      <Route
        path="/delivered-orders"
        element={
          userData ? <RiderDeliveredOrders /> : <Navigate to="/signin" />
        }
      />

      <Route
        path="/owner-delivered-orders"
        element={
          userData ? <OwnerDeliveredOrders /> : <Navigate to="/signin" />
        }
      />

      <Route
        path="/user-received-orders"
        element={
          userData ? <CustomerReceivedOrders /> : <Navigate to="/signin" />
        }
      />

      <Route
        path="/restaurant/:restaurantId"
        element={userData ? <RestaurantCard /> : <Navigate to="/signin" />}
      />

      <Route
        path="/track-shop-order/:shop_order_id"
        element={userData ? <TrackOrder /> : <Navigate to="/signin" />}
      />

      {/* ====================================================== */}
      {/* ADMIN LOGIN */}
      {/* ====================================================== */}

      <Route
        path="/admin/login"
        element={adminData ? <Navigate to="/admin" replace /> : <AdminLogin />}
      />

      {/* ====================================================== */}
      {/* ADMIN PANEL */}
      {/* ====================================================== */}

      <Route
        path="/admin"
        element={
          adminData ? <AdminLayout /> : <Navigate to="/admin/login" replace />
        }
      >
        <Route index element={<AdminDashboard />} />

        <Route path="restaurants" element={<AdminRestaurants />} />

        <Route path="customers" element={<AdminCustomers />} />

        <Route path="riders" element={<AdminRiders />} />

        <Route path="orders" element={<AdminOrders />} />

        <Route path="issues" element={<AdminIssues />} />
      </Route>
    </Routes>
    </AnimatePresence>
  );
}

export default App;
