import {
    useEffect,
    useState
  } from "react";
  
  import { supabase }
  from "../supabase";
  
  import Navbar
  from "../components/Navbar";
  
  export default function LeaveApprovals() {
  
    const user =
      JSON.parse(
        localStorage.getItem("user")
      );
  
    const [leaves, setLeaves] =
      useState([]);
  
    useEffect(() => {
  
      loadLeaves();
  
    }, []);
  
    const loadLeaves =
      async () => {
  
        if (
          user.role === "Admin" ||
          user.role === "HR"
        ) {
  
          const { data } =
            await supabase
              .from("leaves")
              .select("*")
              .eq(
                "status",
                "Pending"
              );
  
          setLeaves(data || []);
  
          return;
        }
  
        const { data: sites } =
          await supabase
            .from("site_details")
            .select("site_name")
            .eq(
              "user_name",
              user.user_name
            )
            .eq(
              "role",
              "Project Head"
            );
  
        const siteNames =
          sites.map(
            s => s.site_name
          );
  
        const { data } =
          await supabase
            .from("leaves")
            .select("*")
            .in(
              "site_name",
              siteNames
            )
            .eq(
              "status",
              "Pending"
            );
  
        setLeaves(data || []);
      };
  
    const updateLeave =
      async (
        id,
        status
      ) => {
  
        await supabase
          .from("leaves")
          .update({
  
            status,
  
            approved_by:
              user.user_name,
  
            approved_on:
              new Date()
  
          })
          .eq(
            "id",
            id
          );
  
        loadLeaves();
      };
  
    return (
      <div>
  
        <Navbar />
  
        <h1>
          Leave Approvals
        </h1>
  
        {leaves.map(
          (leave) => (
  
            <div
  key={leave.id}
  style={{
    background: "#fff",
    padding: "20px",
    marginBottom: "16px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)"
  }}
>
  <h3>{leave.name}</h3>

  <p>
    <strong>Site:</strong>{" "}
    {leave.site_name}
  </p>

  <p>
    <strong>Leave Type:</strong>{" "}
    {leave.leave_type}
  </p>

  <p>
    <strong>Duration:</strong>{" "}
    {leave.from_date}
    {" → "}
    {leave.to_date}
  </p>

  <p>
    <strong>Reason:</strong>{" "}
    {leave.reason}
  </p>

  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "15px"
    }}
  >
    <button
      onClick={() =>
        updateLeave(
          leave.id,
          "Approved"
        )
      }
    >
      Approve
    </button>

    <button
      onClick={() =>
        updateLeave(
          leave.id,
          "Rejected"
        )
      }
    >
      Reject
    </button>
  </div>
</div>
  
          )
        )}
  
      </div>
    );
  }