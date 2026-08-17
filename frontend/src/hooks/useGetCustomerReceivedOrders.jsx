import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../App";
import { setReceivedOrders } from "../redux/userSlice";

function useGetCustomerReceivedOrders() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReceivedOrders = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/user/received-orders`,
          {
            withCredentials: true,
          }
        );

        dispatch(
          setReceivedOrders(response.data.orders || [])
        );
      } catch (error) {
        console.error(
          "GET CUSTOMER RECEIVED ORDERS ERROR:",
          error.response?.data || error.message
        );

        dispatch(setReceivedOrders([]));
      }
    };

    fetchReceivedOrders();
  }, [dispatch]);
}

export default useGetCustomerReceivedOrders;