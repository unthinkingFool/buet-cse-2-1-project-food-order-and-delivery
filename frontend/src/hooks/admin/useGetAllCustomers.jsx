import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { serverUrl } from "../../App";
import {
  setCustomers,
  setCustomersLoading,
  setAdminError,
} from "../../redux/adminSlice";

const useGetAllCustomers = () => {
  const dispatch = useDispatch();

  const { adminData } = useSelector((state) => state.admin);

  useEffect(() => {
    const getAllCustomers = async () => {
      if (!adminData) {
        return;
      }

      try {
        dispatch(setCustomersLoading(true));
        dispatch(setAdminError(null));

        const result = await axios.get(
          `${serverUrl}/api/admin/customers`,
          {
            withCredentials: true,
          }
        );

        if (result.data.success) {
          dispatch(setCustomers(result.data.customers));
        }
      } catch (error) {
        console.error(
          "GET ALL CUSTOMERS ERROR:",
          error
        );

        dispatch(
          setAdminError(
            error.response?.data?.message ||
              "Failed to get customers"
          )
        );
      } finally {
        dispatch(setCustomersLoading(false));
      }
    };

    getAllCustomers();
  }, [adminData, dispatch]);
};

export default useGetAllCustomers;