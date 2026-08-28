import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../../App";
import {
  setAdminData,
  clearAdminData,
  setAdminLoading,
} from "../../redux/adminSlice";

function useGetCurrentAdmin() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getCurrentAdmin = async () => {
      try {
        dispatch(setAdminLoading(true));

        const result = await axios.get(
          `${serverUrl}/api/admin/me`,
          {
            withCredentials: true,
          }
        );

        dispatch(setAdminData(result.data.admin));
      } catch (error) {
        console.log(
          "GET CURRENT ADMIN ERROR:",
          error.response?.data?.message || error.message
        );

        dispatch(clearAdminData());
      } finally {
        dispatch(setAdminLoading(false));
      }
    };

    getCurrentAdmin();
  }, [dispatch]);
}

export default useGetCurrentAdmin;