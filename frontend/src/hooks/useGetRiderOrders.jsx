import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../App";
import {
  setAssignedOrders,
  setDeliveredOrders,
} from "../redux/riderSlice";

function useGetRiderOrders() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [assignedResponse, deliveredResponse] =
          await Promise.all([
            axios.get(
              `${serverUrl}/api/rider/assigned-orders`,
              {
                withCredentials: true,
              }
            ),

            axios.get(
              `${serverUrl}/api/rider/delivered-orders`,
              {
                withCredentials: true,
              }
            ),
          ]);

        dispatch(
          setAssignedOrders(
            assignedResponse.data.orders || []
          )
        );

        dispatch(
          setDeliveredOrders(
            deliveredResponse.data.orders || []
          )
        );
      } catch (error) {
        console.error(
          "FETCH RIDER ORDERS ERROR:",
          error.response?.data || error.message
        );
      }
    };

    fetchOrders();
  }, [dispatch]);
}

export default useGetRiderOrders;