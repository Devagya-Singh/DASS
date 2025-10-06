import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Services Section */}
        <div className="footer-section">
          <h3>SERVICES</h3>
          <ul>
            <li><Link to="/conference">Conference Management</Link></li>
            <li><Link to="/publications">Publishing</Link></li>
            <li><Link to="/library">Research Library</Link></li>
          </ul>
        </div>

        {/* About Section */}
        <div className="footer-section">
          <h3>ABOUT</h3>
          <ul>
            <li><Link to="/aboutus2">About Us</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Conferences Section */}
        <div className="footer-section">
          <h3>CONFERENCES</h3>
          <ul>
            <li><Link to="/conference">Upcoming Conferences</Link></li>
            <li><Link to="/conference">Licenses & Pricing</Link></li>
            <li><Link to="/conference">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact Us Section */}
        <div className="footer-section contact-section">
          <h3>CONTACT</h3>
          <ul>
            <li><a href="mailto:devagyarupsingh@gmail.com">devagyarupsingh@gmail.com</a></li>
            <li><a href="tel:+916206339928">+91 6206 339 928</a></li>
            <li>KIIT University</li>
          </ul>
          <div className="social-icons">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="footer-bottom">
        <p>© 2024 DASS. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
