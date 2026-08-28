import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../../App";

import {
  setDashboardData,
  setDashboardLoading,
  setAdminError,
} from "../../redux/adminSlice";

function useGetAdminDashboard() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAdminDashboard = async () => {
      try {
        dispatch(setDashboardLoading(true));
        dispatch(setAdminError(null));

        const response = await axios.get(
          `${serverUrl}/api/admin/dashboard`,
          {
            withCredentials: true,
          }
        );

        console.log(
          "ADMIN DASHBOARD DATA:",
          response.data
        );

        dispatch(
          setDashboardData(response.data)
        );

      } catch (error) {
        console.error(
          "GET ADMIN DASHBOARD ERROR:",
          error.response?.data ||
            error.message
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get admin dashboard"
          )
        );

      } finally {
        dispatch(
          setDashboardLoading(false)
        );
      }
    };

    getAdminDashboard();

  }, [dispatch]);
}

export default useGetAdminDashboard;