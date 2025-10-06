import React, { useState } from "react";
import "./AboutUs2.css";
import team from "../../assets/team.js"; // Ensure you have an array of team members with their images & roles

const AboutUs2 = () => {
  const [contactInfo] = useState({
    email: "devagyarupsingh@gmail.com",
    phone: "+91 6206 339 928",
    address: "KIIT University"
  });

  return (
    <div className="about-us-container">
      {/* About Us heading */}
      <h1 className="about-us-heading">About Us</h1>

      <p className="about-description">
        DASS streamlines research paper submissions, peer reviews, and conference 
        management with a focus on reliability and security, making it a trusted 
        choice for academic professionals worldwide.
      </p>

      <h3 className="section-title">Contact Us</h3>
      <div className="contact-info">
        <p><strong>Email:</strong> {contactInfo.email}</p>
        <p><strong>Phone:</strong> {contactInfo.phone}</p>
        <p><strong>Address:</strong> {contactInfo.address}</p>
      </div>

      <h3 className="section-title">Our Team</h3>
      <div className="team-container">
        {team.map((member, index) => (
          <div key={index} className="team-card">
            <img src={member.image} alt={member.name} className="team-image" />
            <h4 className="team-name">{member.name}</h4>
            <p className="team-role">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs2;
