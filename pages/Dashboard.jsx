import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const currentUser =
      JSON.parse(storedUser);

    const { data, error } =
      await supabase
        .from("users")
        .select(`
          role,
          site_name,
          user_details (
            name,
            department,
            designation
          )
        `)
        .eq(
          "user_name",
          currentUser.user_name
        )
        .single();

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setDashboardData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <Navbar />

      <div className="dashboard-container">

        <div className="dashboard-header">
          <h1>
            Welcome,
            {" "}
            {dashboardData.user_details.name}
          </h1>

          <p>
            Employee Information
          </p>
        </div>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h3>Name</h3>
            <p>
              {dashboardData.user_details.name}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Department</h3>
            <p>
              {
                dashboardData.user_details.department
              }
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Designation</h3>
            <p>
              {
                dashboardData.user_details.designation
              }
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Role</h3>
            <p>
              {dashboardData.role}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Site</h3>
            <p>
              {dashboardData.site_name}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}