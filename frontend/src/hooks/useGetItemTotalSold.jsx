import { useEffect, useState } from "react";
import axios from "axios";

import { serverUrl } from "../App";

function useGetItemTotalSold(itemId) {
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchTotalSold = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${serverUrl}/api/item/total-sold/${itemId}`,
          {
            withCredentials: true,
          }
        );

        setTotalSold(response.data.total_sold ?? 0);
      } catch (error) {
        console.error("GET TOTAL SOLD ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Failed to get total sold"
        );

        setTotalSold(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalSold();
  }, [itemId]);

  return {
    totalSold,
    loading,
    error,
  };
}

export default useGetItemTotalSold;