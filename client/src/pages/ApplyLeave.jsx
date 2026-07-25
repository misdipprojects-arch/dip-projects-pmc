import { useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

export default function ApplyLeave() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const [siteHeads, setSiteHeads] = useState([]);

  const [leaveType, setLeaveType] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [reason, setReason] = useState("");

  const submitLeave =
    async () => {

      const { data: site } =
        await supabase
          .from("users")
          .select("site_name")
          .eq(
            "user_name",
            user.user_name
          )
          .single();

      const { error } =
        await supabase
          .from("leaves")
          .insert([{
            user_name:
              user.user_name,

            name:
              user.name,

            site_name:
              site.site_name,

            leave_type:
              leaveType,

            from_date:
              fromDate,

            to_date:
              toDate,

            reason,

            status:
              "Pending"
          }]);

      if (error) {
        alert(error.message);
        return;
      }

      alert(
        "Leave Applied Successfully"
      );

      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
    };

  return (
    <div>

      <Navbar />

      <h1>Apply Leave</h1>

      <select
        value={leaveType}
        onChange={(e)=>
          setLeaveType(
            e.target.value
          )
        }
      >
        <option value="">
          Select Leave Type
        </option>

        <option>
          Casual Leave
        </option>

        <option>
          Sick Leave
        </option>

        <option>
          Emergency Leave
        </option>
      </select>

      <br /><br />

      <input
        type="date"
        value={fromDate}
        onChange={(e)=>
          setFromDate(
            e.target.value
          )
        }
      />

      <br /><br />

      <input
        type="date"
        value={toDate}
        onChange={(e)=>
          setToDate(
            e.target.value
          )
        }
      />

      <br /><br />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e)=>
          setReason(
            e.target.value
          )
        }
      />

      <br /><br />

      <button
        onClick={submitLeave}
      >
        Apply
      </button>

    </div>
  );
}