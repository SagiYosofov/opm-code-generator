import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useUser();

  return (
    <nav className="navbar">
      <div className="left">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/about">About</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/opm_upload">OpmUpload</Link>
            <Link to="/about">About</Link>
            <Link to="/projects">UserProjects</Link>
          </>
        )}
      </div>

      <div className="right">
        <button>Light</button>

        {user && (
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
