import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import SignUp from "./pages/signup";
import SignIn from "./pages/signin";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyRestaurant from "./hooks/useGetMyRestaurant";
import CreateEditRestaurant from "./pages/CreateEditRestaurant";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetRestaurantByCity from "./hooks/useGetRestaurantByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";

export const serverUrl = "http://localhost:3000";

function App() {
  useGetCurrentUser();
  useGetCity();
  useGetMyRestaurant();
  useGetRestaurantByCity();
  useGetItemsByCity();
  useGetMyOrders();
  const { userData, cartItems } = useSelector((state) => state.user);
  return (
    <Routes>
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/create-edit-restaurant"
        element={
          userData ? <CreateEditRestaurant /> : <Navigate to={"/signin"} />
        }
      />
      <Route
        path="/add-food"
        element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
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
    </Routes>
  );
}

export default App;
