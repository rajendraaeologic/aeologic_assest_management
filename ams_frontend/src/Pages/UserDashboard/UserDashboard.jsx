import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../Features/auth/authSlice";

const UserDashboard = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="p-6 min-h-screen w-full bg-slate-200 ">
      <h1 className="text-2xl font-bold pt-24">
        Welcome, {user?.name || "User"}!
      </h1>
      <p>
        This is your user dashboard Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Vitae deserunt libero sunt minus enim error atque qui
        odit quis quo ex odio totam vero perspiciatis iste, dolorem distinctio
        tempore commodi.
      </p>
    </div>
  );
};

export default UserDashboard;
