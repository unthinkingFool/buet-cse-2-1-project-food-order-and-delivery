import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";

import { serverUrl } from "../App";

import {
  setMyIssues,
} from "../redux/userSlice";

function useGetMyIssues() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/issue/my-issues`,
          {
            withCredentials: true,
          }
        );

        if (result.data.success) {
          dispatch(
            setMyIssues(result.data.issues)
          );
        }

      } catch (error) {
        console.log(
          "Get my issues error:",
          error.response?.data || error.message
        );
      }
    };

    fetchMyIssues();
  }, [dispatch]);
}

export default useGetMyIssues;