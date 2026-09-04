import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { socket, userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return;

    const fetchOrders = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/order/orders`,
          {
            withCredentials: true,
          },
        );

        dispatch(setMyOrders(result.data.orders));

        console.log("MY ORDERS:", result.data.orders);
      } catch (error) {
        console.log(
          "GET ORDERS ERROR:",
          error.response?.data || error.message,
        );
      }
    };

    // Initial fetch
    fetchOrders();

    // Listen for new orders
    if (socket) {
      socket.on("new_shop_order", fetchOrders);
      socket.on("order_status_changed", fetchOrders);
      socket.on("order_rider_assigned", fetchOrders);
    }

    return () => {
      if (socket) {
        socket.off("new_shop_order", fetchOrders);
        socket.off("order_status_changed", fetchOrders);
        socket.off("order_rider_assigned", fetchOrders);
      }
    };
  }, [dispatch, socket, userData]);
}

export default useGetMyOrders;