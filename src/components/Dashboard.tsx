import React from "react";
import { GamifiedDashboard } from "./GamifiedDashboard";

interface DashboardProps {
  user: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return <GamifiedDashboard user={user} />;
};