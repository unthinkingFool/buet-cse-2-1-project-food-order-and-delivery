import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../../App";

import {
  setRestaurants,
  setRestaurantsLoading,
  setAdminError,
} from "../../redux/adminSlice";

function useGetAllRestaurants() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllRestaurants = async () => {
      try {
        dispatch(
          setRestaurantsLoading(true)
        );

        dispatch(
          setAdminError(null)
        );

        const response = await axios.get(
          `${serverUrl}/api/admin/restaurants`,
          {
            withCredentials: true,
          }
        );

        console.log(
          "ADMIN RESTAURANTS:",
          response.data
        );

        dispatch(
          setRestaurants(
            response.data.restaurants
          )
        );

      } catch (error) {
        console.error(
          "GET ALL RESTAURANTS ERROR:",
          error.response?.data ||
            error.message
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get restaurants"
          )
        );

      } finally {
        dispatch(
          setRestaurantsLoading(false)
        );
      }
    };

    getAllRestaurants();

  }, [dispatch]);
}

export default useGetAllRestaurants;