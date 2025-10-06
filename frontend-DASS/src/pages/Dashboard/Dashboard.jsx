import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // configurable backend URL

const Dashboard = () => {
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewAll, setViewAll] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && token !== "undefined") {
      fetchUserPublications();
    }
  }, [token]);

  const fetchUserPublications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/publications/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPublications(res.data);
    } catch (err) {
      console.error("Failed to fetch publications:", err.response?.data || err.message);
    }
  };

  const filteredPublications = publications.filter((pub) =>
    pub.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPublications = viewAll
    ? filteredPublications
    : filteredPublications.slice(0, 3);

  return (
    <div className="dashboard">
      <h2>{viewAll ? "All Publications" : "Your Recent Publications"}</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search your publications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        {filteredPublications.length > 3 && (
          <button
            className="view-all-btn"
            onClick={() => setViewAll((prev) => !prev)}
          >
            {viewAll ? "View Less" : "View All"}
          </button>
        )}
      </div>

      <div className="publications-list">
        {displayedPublications.map((pub) => (
          <div className="publication-card" key={pub.id || pub._id}>
            <h3>{pub.title}</h3>
            <p>
              <strong>Published on:</strong>{" "}
              {new Date(pub.publication_date || pub.publicationDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status ${pub.status.toLowerCase()}`}>
                {pub.status}
              </span>
            </p>
            <p className="abstract">
              <strong>Abstract:</strong> {pub.abstract}
            </p>
            {(pub.pdf_path || pub.pdfPath) && (
              <div className="pdf-actions">
                <a
                  href={`${BACKEND_URL}/uploads/${pub.pdf_path || pub.pdfPath}`}
                  className="pdf-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View / Download PDF
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
