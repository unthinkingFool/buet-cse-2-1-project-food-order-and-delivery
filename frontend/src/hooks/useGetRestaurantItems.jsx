import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

function useGetRestaurantItems(restaurantId) {
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const getRestaurantItems = async () => {
      try {
        setLoading(true);

        const result = await axios.get(
          `${serverUrl}/api/restaurant/items/${restaurantId}`,
          {
            withCredentials: true,
          },
        );

        setRestaurant(result.data.restaurant);
        setItems(result.data.items);
      } catch (error) {
        console.log(
          "Error while getting restaurant items:",
          error,
        );

        setRestaurant(null);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    getRestaurantItems();
  }, [restaurantId]);

  return {
    restaurant,
    items,
    loading,
  };
}

export default useGetRestaurantItems;