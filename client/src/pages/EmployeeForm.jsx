import { useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

export default function EmployeeForm() {

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const save = async () => {

    if (
      !name ||
      !username ||
      !password ||
      !department ||
      !designation
    ) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase
      .from("user_details")
      .insert([
        {
          name,
          user_name: username,
          password,
          department,
          designation
        }
      ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Employee Saved Successfully");

    setName("");
    setUsername("");
    setPassword("");
    setDepartment("");
    setDesignation("");
  };

  return (
    <div>
      <Navbar />

      <h1>Employee Entry</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <input
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <input
        placeholder="Department"
        value={department}
        onChange={(e) =>
          setDepartment(e.target.value)
        }
      />

      <input
        placeholder="Designation"
        value={designation}
        onChange={(e) =>
          setDesignation(e.target.value)
        }
      />

      <button onClick={save}>
        Save Employee
      </button>

    </div>
  );
}