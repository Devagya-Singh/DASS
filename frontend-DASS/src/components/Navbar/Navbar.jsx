import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import pfp from "../../assets/pfp.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const readAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true" || !!localStorage.getItem("token") || !!localStorage.getItem("sysadminToken");
      const role = localStorage.getItem("userRole");
      setIsLoggedIn(loggedIn);
      setUserRole(role);
    };
    readAuth();

    const handleStorage = () => readAuth();
    const handleAuthChanged = () => readAuth();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("sysadminToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserRole(null);

    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  return (
    <header className="navbar-container">
      <Link to="/" className="logo-container">
        <img src={logo} alt="DASS Logo" className="logo" />
        <span className="site-title">Dynamic Academic Submission System</span>
      </Link>

      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </div>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        {userRole !== 'system_admin' && <Link to="/" className="nav-button">Home</Link>}

        {/* Show Dashboard only if user is logged in and not an admin */}
        {isLoggedIn && userRole !== "admin" && (
          <Link to="/dashboard" className="nav-button">Dashboard</Link>
        )}

        {/* Only show Publications if user is not admin */}
        {userRole !== "admin" && userRole !== 'system_admin' && (
          <Link to="/publications" className="nav-button">Publications</Link>
        )}

        {userRole !== 'system_admin' && <Link to="/conference" className="nav-button">Conferences</Link>}
        {userRole !== 'system_admin' && <Link to="/library" className="nav-button">Library</Link>}
        {userRole !== 'system_admin' && <Link to="/aboutus2" className="nav-button">About Us</Link>}

        {isLoggedIn ? (
          <div className="profile-container">
            <img
              src={pfp}
              alt="Profile"
              className="profile-img"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="profile-dropdown">
                {userRole !== 'system_admin' && <Link to="/profile" className="dropdown-item">Profile</Link>}
                {(userRole === "admin" || userRole === "system_admin") && (
                  <>
                    {userRole === "admin" && <Link to="/admin" className="dropdown-item admin-item">Admin Page</Link>}
                    {userRole === "system_admin" && <Link to="/system-admin" className="dropdown-item system-admin-item">System Admin</Link>}
                  </>
                )}
                <button className="dropdown-item logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-button">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
