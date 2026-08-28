import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../../App";

import {
  setPendingRestaurants,
  setRestaurantsLoading,
  setAdminError,
} from "../../redux/adminSlice";

function useGetPendingRestaurants() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllPendingRestaurants = async () => {
      try {
        dispatch(
          setRestaurantsLoading(true)
        );

        dispatch(
          setAdminError(null)
        );

        const response = await axios.get(
          `${serverUrl}/api/admin/restaurants/pending`,
          {
            withCredentials: true,
          }
        );

        console.log(
          "ADMIN PENDING RESTAURANTS:",
          response.data
        );

        dispatch(
          setPendingRestaurants(
            response.data.restaurants
          )
        );

      } catch (error) {
        console.error(
          "GET ALL PENDING RESTAURANTS ERROR:",
          error.response?.data ||
            error.message
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get pending restaurants"
          )
        );

      } finally {
        dispatch(
          setRestaurantsLoading(false)
        );
      }
    };

    getAllPendingRestaurants();

  }, [dispatch]);
}

export default useGetPendingRestaurants;