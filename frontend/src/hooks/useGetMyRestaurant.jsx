import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { setRestaurantData } from "../redux/ownerSlice";

function useGetMyRestaurant() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/restaurant/get-my`, {
          withCredentials: true,
        });
        dispatch(setRestaurantData(result.data));
      } catch (error) {
        console.log("STATUS:", error.response?.status);

        console.log("DATA:", error.response?.data);

        console.log("MESSAGE:", error.message);
      }
    };
    fetchRestaurant();
  }, []);
}

export default useGetMyRestaurant;
