import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="left">
          {!user ? (
            <>
              <NavLink to="/login" className="nav-tile">Login</NavLink>
              <NavLink to="/about" className="nav-tile">About</NavLink>
              <NavLink to="/signup" className="nav-tile">Signup</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/opm_code_generator" className="nav-tile">OpmCodeGenerator</NavLink>
              <NavLink to="/about" className="nav-tile">About</NavLink>
              <NavLink to="/projects" className="nav-tile">UserProjects</NavLink>
            </>
          )}
        </div>

        <div className="right">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          {user && (
            <button onClick={logout} className="nav-tile logout-btn">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;