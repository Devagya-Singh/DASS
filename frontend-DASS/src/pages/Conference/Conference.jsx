import React, { useEffect, useState } from "react";
import "./Conference.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Conference = () => {
  const [conferences, setConferences] = useState([]);
  const [upcomingConferences, setUpcomingConferences] = useState([]);
  const [pastConferences, setPastConferences] = useState([]);
  const [userPapers, setUserPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedConference, setSelectedConference] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [expandedConfId, setExpandedConfId] = useState(null);
  const [newConference, setNewConference] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    conference_type: "upcoming",
    website_url: "",
    registration_fee: "",
  });

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        // Fetch upcoming conferences
        const upcomingRes = await axios.get(`${API_BASE_URL}/conference?type=upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingConferences(upcomingRes.data);

        // Fetch past conferences
        const pastRes = await axios.get(`${API_BASE_URL}/conference?type=past`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPastConferences(pastRes.data);

        // Fetch all conferences for admin
        const allRes = await axios.get(`${API_BASE_URL}/conference`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConferences(allRes.data);
      } catch (err) {
        console.error("Error fetching conferences", err);
      }
    };

    const fetchApprovedPapers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/publications/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const approved = res.data.filter((paper) => (paper.status || '').toLowerCase() === "approved");
        setUserPapers(approved);
      } catch (err) {
        console.error("Error fetching user papers", err);
      }
    };

    const role = localStorage.getItem("userRole") || "author";
    setIsAdmin(role === "admin");

    if (token) {
      fetchConferences();
      if (role !== "admin") fetchApprovedPapers();
    }
  }, [token]);

  const handleCreateConference = async () => {
    const { name, date, location, description } = newConference;

    if (!name || !date || !location || !description) {
      alert("Please fill in all the fields");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/conference`,
        newConference,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh upcoming/past lists so UI reflects new item immediately
      try {
        const [upcomingRes, pastRes, allRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/conference?type=upcoming`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/conference?type=past`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/conference`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUpcomingConferences(upcomingRes.data);
        setPastConferences(pastRes.data);
        setConferences(allRes.data);
      } catch (e) {
        // non-fatal; UI will still show created item in details list
      }
      setNewConference({ name: "", date: "", location: "", description: "" });
      alert("Conference created successfully!");
    } catch (err) {
      console.error("Error creating conference", err);
      alert("Failed to create conference");
    }
  };

  const handleSubmit = async () => {
    if (!selectedPaper || !selectedConference) return;

    try {
      await axios.post(
        `${API_BASE_URL}/conference/submit`,
        {
          paperId: Number(selectedPaper),
          conferenceId: Number(selectedConference),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Paper submitted to the conference!");
      setSelectedPaper("");
      setSelectedConference("");
    } catch (err) {
      console.error("Error submitting paper", err);
      alert("Failed to submit paper");
    }
  };

  const isLoggedIn = !!token;

  return (
    <div className="conference">
      <div className="conference-header">
        <h2 className="conference-heading">🌍 Global Conferences</h2>
        <p>Discover upcoming and past research conferences worldwide</p>
      </div>

      {!isLoggedIn ? (
        <div className="conference-container">
          <div className="login-message">
            Please <Link to="/login">log in</Link> to see conferences and submit papers.
          </div>
        </div>
      ) : (
        <>
          {/* Conference Tabs */}
          <div className="conference-tabs">
            <button
              className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              🔮 Upcoming Conferences ({upcomingConferences.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              📚 Past Conferences ({pastConferences.length})
            </button>
          </div>

          {/* Conference Tables */}
          <div className="conference-content">
            {(activeTab === "upcoming" ? upcomingConferences : pastConferences).length === 0 ? (
              <div className="no-conference-msg">
                <h3>{activeTab === 'upcoming' ? 'No upcoming conferences' : 'No past conferences'}</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === "upcoming" ? upcomingConferences : pastConferences).map((conf) => (
                      <React.Fragment key={conf.id}>
                        <tr>
                          <td>{conf.id}</td>
                          <td>{conf.name}</td>
                          <td>{conf.location}</td>
                          <td>{new Date(conf.date || conf.start_date).toLocaleDateString()}</td>
                          <td>
                            <button className="submit-btn" onClick={() => setExpandedConfId(expandedConfId === conf.id ? null : conf.id)}>
                              {expandedConfId === conf.id ? 'Hide' : 'Details'}
                            </button>
                            {!isAdmin && activeTab === 'upcoming' && (
                              <button
                                className="submit-btn"
                                onClick={() => setSelectedConference(conf.id)}
                              >
                                📄 Submit Paper
                              </button>
                            )}
                            {isAdmin && activeTab === 'upcoming' && (
                              <button
                                className="submit-btn"
                                onClick={async () => {
                                  try {
                                    await axios.post(`${API_BASE_URL}/conference/${conf.id}/chair/self`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                    alert('You are now chair for this conference');
                                  } catch (e) {
                                    alert(e.response?.data?.message || 'Failed to assign chair');
                                  }
                                }}
                              >
                                👤 Become Chair
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedConfId === conf.id && (
                          <tr>
                            <td colSpan={5}>
                              <div className="conference-details">
                                <p><strong>📝 Description:</strong> {conf.description}</p>
                                {conf.website_url && (
                                  <p><strong>🌐 Website:</strong> <a href={conf.website_url} target="_blank" rel="noopener noreferrer">{conf.website_url}</a></p>
                                )}
                                {conf.registration_fee && (
                                  <p><strong>💰 Fee:</strong> {conf.registration_fee}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Admin - Create Conference */}
      {isAdmin && (
        <div className="create-conference-form">
          <h3>Add New Conference</h3>
          <input
            type="text"
            placeholder="Conference Name"
            value={newConference.name}
            onChange={(e) =>
              setNewConference({ ...newConference, name: e.target.value })
            }
          />
          <input
            type="date"
            value={newConference.date}
            onChange={(e) =>
              setNewConference({ ...newConference, date: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Location"
            value={newConference.location}
            onChange={(e) =>
              setNewConference({ ...newConference, location: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newConference.description}
            onChange={(e) =>
              setNewConference({ ...newConference, description: e.target.value })
            }
          />
          <button className="create-btn" onClick={handleCreateConference}>
            Create Conference
          </button>
        </div>
      )}

      {/* Author - Submit Paper */}
      {!isAdmin && selectedConference && (
        <div className="submission-form">
          <h3>
            Submit to {conferences.find((c) => String(c.id) === String(selectedConference))?.name || ''}
          </h3>
          {userPapers.length === 0 ? (
            <p>You have no approved papers to submit.</p>
          ) : (
            <>
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
              >
                <option value="">Select your approved paper</option>
                {userPapers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.title}
                  </option>
                ))}
              </select>
              <button className="submit-btn" onClick={handleSubmit} disabled={!selectedPaper}>
                Submit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Conference;
