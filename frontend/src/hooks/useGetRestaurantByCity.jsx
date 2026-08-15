import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity, setUserData } from "../redux/userSlice";
function useGetRestaurantByCity() {
  const dispatch = useDispatch();
  const { city } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/restaurant/get-by-city/${city}`,
          {
            withCredentials: true,
          },
        );
        dispatch(setShopsInMyCity(result.data.restaurants));
        console.log(result.data)
      } catch (error) {
        console.log("STATUS:", error.response?.status);

        console.log("DATA:", error.response?.data);

        console.log("MESSAGE:", error.message);
      }
    };
    fetchShops();
  }, [city]);
}

export default useGetRestaurantByCity;
