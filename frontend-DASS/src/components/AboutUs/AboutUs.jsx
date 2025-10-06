import React, { useEffect, useState } from "react";
import "./AboutUs.css";
import team from "../../assets/team.js";
import { Link } from "react-router-dom";
import axios from "axios";

const AboutUs = () => {
  const [conferences, setConferences] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // configurable backend URL

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/conference`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const validConfs = res.data.filter(
          (conf) => conf.name && conf.name.trim() !== ""
        );
        setConferences(validConfs);
      } catch (err) {
        console.error("Error fetching conferences", err);
      }
    };

    // Check login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (token) {
      fetchConferences();
    }
  }, [token]);

  return (
    <div className="about-us-container">
      <h2 className="about-title">About DASS</h2>
      <p className="about-description">
        DASS streamlines research paper submissions, peer reviews, and conference
        management with a focus on reliability and security, making it a trusted
        choice for academic professionals worldwide.
      </p>

      <h3 className="section-title">Upcoming Conferences</h3>

      {isLoggedIn ? (
        <div className="conference-list">
          {conferences.length > 0 ? (
            conferences.map((conf) => (
              <div key={conf._id} className="conference-card">
                <h4>{conf.name}</h4>
                {conf.date && (
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(conf.date).toLocaleDateString()}
                  </p>
                )}
                {conf.location && (
                  <p>
                    <strong>Location:</strong> {conf.location}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p>No upcoming conferences at the moment.</p>
          )}
        </div>
      ) : (
        <div className="login-message">
          <p>
            Please <Link to="/login">login</Link> to view upcoming conferences.
          </p>
        </div>
      )}

      <h3 className="section-title">Our Team</h3>
      <div className="team-container">
        {team.map((member, index) => (
          <div key={index} className="team-card">
            <img
              src={member.image}
              alt={member.name}
              className="team-image"
            />
            <h4 className="team-name">{member.name}</h4>
            <p className="team-role">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
