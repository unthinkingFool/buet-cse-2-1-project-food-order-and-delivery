import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setCity, setAddress } from "../redux/userSlice";
import { setaddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  // Stores the last location that was actually saved to the database
  const lastSavedLocation = React.useRef(null);

  // ==========================================
  // CALCULATE DISTANCE BETWEEN TWO GPS POINTS
  // ==========================================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    // Don't start location tracking before user is available
    if (!userData) {
      return;
    }

    // Check browser support
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    // ==========================================
    // CONTINUOUSLY WATCH USER'S LOCATION
    // ==========================================
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("Current GPS:", {
          latitude,
          longitude,
        });

        // ==========================================
        // 1. UPDATE REDUX LOCATION
        // ==========================================
        // This happens on every GPS update.
        // It keeps the frontend location live.
        dispatch(
          setLocation({
            lat: latitude,
            lon: longitude,
          }),
        );

        // ==========================================
        // 2. CHECK WHETHER CUSTOMER MOVED 30+ METERS
        // ==========================================
        let shouldUpdateDatabase = false;

        // First GPS location
        if (!lastSavedLocation.current) {
          shouldUpdateDatabase = true;
        } else {
          const distance = getDistance(
            lastSavedLocation.current.latitude,
            lastSavedLocation.current.longitude,
            latitude,
            longitude,
          );

          console.log("Distance moved:", distance.toFixed(2), "meters");

          // Only update database after moving 30 meters
          if (distance >= 30) {
            shouldUpdateDatabase = true;
          }
        }

        // ==========================================
        // 3. UPDATE CUSTOMER LOCATION IN DATABASE
        // ==========================================
        if (shouldUpdateDatabase) {
          try {
            await axios.put(
              `${serverUrl}/api/user/location`,
              {
                latitude,
                longitude,
              },
              {
                withCredentials: true,
              },
            );

            // Save this as the last location
            // that was successfully sent to the database
            lastSavedLocation.current = {
              latitude,
              longitude,
            };

            console.log("Location updated in database");
          } catch (error) {
            console.error(
              "Error updating location:",
              error?.response?.data || error.message,
            );
          }
        }

        // ==========================================
        // 4. REVERSE GEOCODING USING GEOAPIFY
        // ==========================================
        const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

        try {
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
          );

          const city = result?.data?.results?.[0]?.city;
          const address = result?.data?.results?.[0]?.formatted;

          console.log("City:", city);
          console.log("Address:", address);

          // ==========================================
          // 5. UPDATE CITY IN REDUX
          // ==========================================
          if (city) {
            dispatch(setCity(city));
          }

          // ==========================================
          // 6. UPDATE ADDRESS IN REDUX
          // ==========================================
          if (address) {
            dispatch(setAddress(address));
            dispatch(setaddress(address));
          }
        } catch (error) {
          console.error("Geoapify error:", error);
        }
      },

      // ==========================================
      // GEOLOCATION ERROR
      // ==========================================
      (error) => {
        console.error("Geolocation error:", error);
      },

      // ==========================================
      // GEOLOCATION OPTIONS
      // ==========================================
      {
        enableHighAccuracy: true,

        // Browser may use a location cached within 5 seconds
        maximumAge: 5000,

        // Wait maximum 10 seconds for a location
        timeout: 10000,
      },
    );

    // ==========================================
    // CLEANUP
    // ==========================================
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData, dispatch]);

  return null;
}

export default useGetCity;
