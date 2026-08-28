import { useDispatch } from "react-redux";
import axios from "axios";

import { serverUrl } from "../../App";

import {
  approveRestaurantInState as approveRestaurantRedux,
  setAdminError,
} from "../../redux/adminSlice";

function useApproveRestaurant() {
  const dispatch = useDispatch();

  const approveRestaurant = async (restaurantId) => {
    try {
      dispatch(setAdminError(null));

      const response = await axios.patch(
        `${serverUrl}/api/admin/restaurants/${restaurantId}/approve`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log(
        "APPROVE RESTAURANT:",
        response.data
      );

      dispatch(
        approveRestaurantRedux(restaurantId)
      );

      return {
        success: true,
        restaurant: response.data.restaurant,
      };
    } catch (error) {
      console.error(
        "APPROVE RESTAURANT ERROR:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to approve restaurant";

      dispatch(setAdminError(message));

      return {
        success: false,
        message,
      };
    }
  };

  return {
    approveRestaurant,
  };
}

export default useApproveRestaurant;