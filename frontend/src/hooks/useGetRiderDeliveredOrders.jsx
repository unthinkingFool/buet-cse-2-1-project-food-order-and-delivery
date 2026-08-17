import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setDeliveredOrders } from "../redux/riderSlice";

function useGetRiderDeliveredOrders() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/rider/delivered-orders`,
          {
            withCredentials: true,
          }
        );

        dispatch(
          setDeliveredOrders(response.data.orders || [])
        );
      } catch (error) {
        console.error(
          "GET RIDER DELIVERED ORDERS ERROR:",
          error.response?.data || error.message
        );
      }
    };

    fetchDeliveredOrders();
  }, [dispatch]);
}

export default useGetRiderDeliveredOrders;