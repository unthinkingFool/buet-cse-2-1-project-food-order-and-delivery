import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData, setCity ,setAddress} from "../redux/userSlice";
import { setaddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
    const {userData} = useSelector(state=>state.user)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      console.log(position);

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({lat:latitude,lon:longitude}))
      const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
        );
        
        console.log(result.data.results[0].city);
        dispatch(setCity(result?.data.results[0].city));
        dispatch(setAddress(result?.data.results[0].formatted));
        console.log(result?.data.results[0].formatted)
        const address=result?.data.results[0].formatted;
        dispatch(setaddress(address))
      } catch (error) {
        console.error("Geoapify error:", error);
      }
    });
  }, [userData]);

  return null;
}

export default useGetCity;
