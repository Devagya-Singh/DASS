import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Publications.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // configurable backend URL

const Publication = () => {
  const [title, setTitle] = useState("");
  const [pubDate, setPubDate] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [accessType, setAccessType] = useState("free");
  const [keywords, setKeywords] = useState("");
  const [doi, setDoi] = useState("");
  const [publications, setPublications] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && token !== "undefined") {
      setIsLoggedIn(true);
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pubDate || !abstract || !file) {
      alert("Please fill out all fields and upload a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("publicationDate", pubDate);
    formData.append("pdf", file);
    formData.append("access_type", accessType);
    formData.append("keywords", keywords);
    formData.append("doi", doi);

    try {
      await axios.post(`${BACKEND_URL}/publications/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Publication submitted for approval.");
      setTitle("");
      setPubDate("");
      setAbstract("");
      setFile(null);
      setAccessType("free");
      setKeywords("");
      setDoi("");
      fetchUserPublications();
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err.message);
      alert("Failed to submit publication.");
    }
  };

  return (
    <div className="publication-container">
      <h2>Research Publications</h2>

      {isLoggedIn ? (
        <>
          <h3>Submit a New Research Paper</h3>
          <form className="publication-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title of the Paper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="date"
              value={pubDate}
              onChange={(e) => setPubDate(e.target.value)}
            />
            <textarea
              placeholder="Abstract"
              rows="5"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />

            <div className="form-row">
              <div className="form-group">
                <label>Access Type</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value)}
                >
                  <option value="free">🆓 Free Access</option>
                  <option value="paid">💰 Paid Access</option>
                  <option value="subscription">🔒 Subscription Required</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  placeholder="AI, machine learning, deep learning"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>DOI (optional)</label>
              <input
                type="text"
                placeholder="10.1000/182"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>

            <div className="file-upload-wrapper">
              <label className="custom-file-upload">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                Choose PDF File
              </label>
              {file && <p className="file-name">Selected: {file.name}</p>}
            </div>

            <button type="submit">Submit Paper</button>
          </form>

          <h3>Your Previous Publications</h3>
          <div className="publications-list">
            {publications.length > 0 ? (
              publications.map((pub) => (
                <div key={pub.id || pub._id} className="publication-item">
                  <h4>{pub.title}</h4>
                  <p><strong>Date:</strong> {new Date(pub.publication_date || pub.publicationDate).toLocaleDateString()}</p>
                  <p><strong>Abstract:</strong> {pub.abstract}</p>

                  {pub.pdf_path && (
                    <p>
                      <strong>PDF:</strong>{" "}
                      <a
                        href={`${BACKEND_URL}/uploads/${pub.pdf_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                      >
                        View Paper
                      </a>{" "}
                      |{" "}
                      <a
                        href={`${BACKEND_URL}/uploads/${pub.pdf_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="pdf-link"
                      >
                        Download PDF
                      </a>
                    </p>
                  )}

                  <span className={`status ${pub.status.toLowerCase()}`}>
                    {pub.status === "approved"
                      ? "✅ Approved"
                      : pub.status === "rejected"
                      ? "❌ Rejected"
                      : "🕓 Pending"}
                  </span>
                </div>
              ))
            ) : (
              <p>No publications found.</p>
            )}
          </div>
        </>
      ) : (
        <div className="login-prompt">
          <h3>Please <a href="/login">log in</a> to publish a research paper.</h3>
        </div>
      )}
    </div>
  );
};

export default Publication;
