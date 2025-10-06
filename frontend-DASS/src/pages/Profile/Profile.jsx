import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          setMessage(data.message || "Failed to fetch user data.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setMessage("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    navigate("/");
    setTimeout(() => window.location.reload(), 50);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const res = await fetch("http://localhost:5000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
        setMessage("Profile updated successfully.");
      } else {
        setMessage(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("An error occurred while updating profile.");
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage("Please enter your password to delete account");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await res.json();
      if (res.ok) {
        // Clear all local storage
        localStorage.clear();
        setMessage("Account deleted successfully. Redirecting...");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      } else {
        setMessage(data.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("An error occurred while deleting account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="user-profile">Loading...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-card">
        <h2>User Profile</h2>

        {message && <p className="message">{message}</p>}

        <div className="profile-info">
          {isEditing ? (
            <>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="edit-input"
              />
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="edit-input"
              />
              <input
                type="text"
                name="role"
                value={user.role}
                onChange={handleChange}
                className="edit-input"
              />
            </>
          ) : (
            <>
              <p><span className="label">Name:</span> {user.name}</p>
              <p><span className="label">Email:</span> {user.email}</p>
              <p><span className="label">Role:</span> {user.role}</p>
            </>
          )}
        </div>

        <div className="profile-buttons">
          {isEditing ? (
            <button className="save-btn" onClick={handleSaveClick}>Save</button>
          ) : (
            <button className="edit-btn" onClick={handleEditClick}>Edit Profile</button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <button 
            className="delete-btn" 
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Delete Account</h3>
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
            <div className="modal-input">
              <label>Enter your password to confirm:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <div className="modal-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
