import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { serverUrl } from "../../App";
import {
  setRiders,
  setRidersLoading,
  setAdminError,
} from "../../redux/adminSlice";

const useGetAllRiders = () => {
  const dispatch = useDispatch();

  const { adminData } = useSelector((state) => state.admin);

  useEffect(() => {
    const getAllRiders = async () => {
      if (!adminData) {
        return;
      }

      try {
        dispatch(setRidersLoading(true));
        dispatch(setAdminError(null));

        const result = await axios.get(
          `${serverUrl}/api/admin/riders`,
          {
            withCredentials: true,
          }
        );

        if (result.data.success) {
          dispatch(setRiders(result.data.riders));
        }
        console.log(result.rows);
      } catch (error) {
        console.error(
          "GET ALL RIDERS ERROR:",
          error
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get riders"
          )
        );
      } finally {
        dispatch(setRidersLoading(false));
      }
    };

    getAllRiders();
  }, [adminData, dispatch]);
};

export default useGetAllRiders;