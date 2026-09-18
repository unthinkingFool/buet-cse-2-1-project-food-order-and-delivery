import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";



import {
  setIssueReports,
} from "../../redux/adminSlice";
import { serverUrl } from "../../App";

function useGetAllIssuesAdmin() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/issue/all`,
          {
            withCredentials: true,
          }
        );

        if (result.data.success) {
          dispatch(
            setIssueReports(result.data.issues)
          );
        }

      } catch (error) {
        console.log(
          "Get all issues error:",
          error.response?.data || error.message
        );
      }
    };

    fetchAllIssues();
  }, [dispatch]);
}

export default useGetAllIssuesAdmin;