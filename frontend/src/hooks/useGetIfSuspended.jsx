import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setIsSuspended } from "../redux/userSlice";

function useGetIfSuspended() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getSuspensionStatus = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/restaurant/is-suspended`,
          { withCredentials: true },
        );

        dispatch(setIsSuspended(result.data.isSuspended));
      } catch (error) {
        console.log(
          "error while checking restaurant suspension status:",
          error.response?.data || error.message,
        );

        dispatch(setIsSuspended(false));
      }
    };

    getSuspensionStatus();
  }, [dispatch]);
}

export default useGetIfSuspended;