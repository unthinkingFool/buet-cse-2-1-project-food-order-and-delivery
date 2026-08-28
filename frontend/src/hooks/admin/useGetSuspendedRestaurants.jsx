import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../../App";

import {
  setSuspendedRestaurants,
  setRestaurantsLoading,
  setAdminError,
} from "../../redux/adminSlice";

function useGetSuspendedRestaurants() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllSuspendedRestaurants = async () => {
      try {
        dispatch(
          setRestaurantsLoading(true)
        );

        dispatch(
          setAdminError(null)
        );

        const response = await axios.get(
          `${serverUrl}/api/admin/restaurants/suspended`,
          {
            withCredentials: true,
          }
        );

        console.log(
          "ADMIN SUSPENDED RESTAURANTS:",
          response.data
        );

        dispatch(
          setSuspendedRestaurants(
            response.data.restaurants
          )
        );

      } catch (error) {
        console.error(
          "GET ALL SUSPENDED RESTAURANTS ERROR:",
          error.response?.data ||
            error.message
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get suspended restaurants"
          )
        );

      } finally {
        dispatch(
          setRestaurantsLoading(false)
        );
      }
    };

    getAllSuspendedRestaurants();

  }, [dispatch]);
}

export default useGetSuspendedRestaurants;