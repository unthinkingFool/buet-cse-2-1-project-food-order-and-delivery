import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setItemsInMyCity } from "../redux/userSlice";

function useGetItemsByCity() {
  const dispatch = useDispatch();

  const { city } = useSelector((state) => state.user);

  useEffect(() => {
    if (!city) return;

    const getItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/restaurant/items-city/${city}`,
        );

        console.log(result.data);

        dispatch(setItemsInMyCity(result.data.items));
      } catch (error) {
        console.log(
          "Error while getting items by city:",
          error,
        );
      }
    };

    getItems();
  }, [city, dispatch]);
}

export default useGetItemsByCity;