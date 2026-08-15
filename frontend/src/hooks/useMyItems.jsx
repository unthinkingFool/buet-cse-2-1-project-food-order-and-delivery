import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setItems } from "../redux/ownerSlice";

function useMyItems() {
  const dispatch = useDispatch();

  const { restaurantData } = useSelector(
    (state) => state.owner
  );

  useEffect(() => {
    const getMyItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/restaurant/my-items`,
          {
            withCredentials: true,
          }
        );

        dispatch(setItems(result.data.items));

      } catch (error) {
        console.log(
          "error while getting my items:",
          error
        );
      }
    };

    // Only fetch items if restaurant exists
    if (restaurantData) {
      getMyItems();
    }
  }, [restaurantData, dispatch]);
}

export default useMyItems;