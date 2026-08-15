import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();

  useEffect(() => {
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

    fetchOrders();
  }, [dispatch]);
}

export default useGetMyOrders;