import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import RiderDashboard from "../components/RiderDashboard";

function Home() {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {userData.role == "customer" && <UserDashboard />}
      {userData.role == "owner" && <OwnerDashboard />}
      {userData.role == "rider" && <RiderDashboard />}
    </div>
  );
}

export default Home;