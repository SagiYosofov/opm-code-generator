import React from "react";
import { NavLink } from "react-router-dom"; // <-- use NavLink
import { useUser } from "../context/UserContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useUser();

  // Function to apply active class
  const navLinkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="navbar">
      <div className="left">
        {!user ? (
          <>
            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/signup" className={navLinkClass}>Signup</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/opm_code_generator" className={navLinkClass}>OpmCodeGenerator</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/projects" className={navLinkClass}>UserProjects</NavLink>
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
