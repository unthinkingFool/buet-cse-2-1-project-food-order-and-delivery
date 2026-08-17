import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";

function useGetOwnerCompletedOrders(setCompletedOrders) {
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/restaurant/completed-orders`,
          {
            withCredentials: true,
          }
        );

        setCompletedOrders(response.data.orders || []);
      } catch (error) {
        console.error(
          "GET COMPLETED ORDERS ERROR:",
          error.response?.data || error.message
        );
      }
    };

    fetchCompletedOrders();
  }, [setCompletedOrders]);
}

export default useGetOwnerCompletedOrders;