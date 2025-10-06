import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/publications/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPapers(res.data);
      } catch (error) {
        console.error("Failed to fetch papers:", error);
      }
    };

    fetchPapers();
  }, []);

  const handleApproval = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/publications/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedPaper = res.data;

      // Update state with updated paper
      setPapers((prevPapers) =>
        prevPapers.map((paper) =>
          paper._id === updatedPaper._id ? updatedPaper : paper
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Research Paper Submissions</h2>
      <table className="paper-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author Name</th>
            <th>Author Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper._id}>
              <td>
                {paper.pdfPath ? (
                  <a
                    href={`http://localhost:5000/uploads/${paper.pdfPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-link"
                  >
                    {paper.title}
                  </a>
                ) : (
                  paper.title
                )}
              </td>
              <td>{paper.author?.name || "Unknown"}</td>
              <td>{paper.author?.email || "Unknown"}</td>
              <td className={`status ${paper.status.toLowerCase()}`}>
                {paper.status}
              </td>
              <td>
                {paper.status === "pending" ? (
                  <>
                    <button
                      className="approve"
                      onClick={() => handleApproval(paper._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject"
                      onClick={() => handleApproval(paper._id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span>No Actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
