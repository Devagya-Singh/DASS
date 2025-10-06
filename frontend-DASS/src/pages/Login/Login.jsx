import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("author");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    setError("");
    
    if (isSignUp && (!fullName || fullName.trim().length < 2)) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (!role) {
      setError("Please select a role");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const endpoint = isSignUp ? "/register" : "/login";
    const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url = `${BASE}/users${endpoint}`;
    const payload = isSignUp
      ? { name: fullName.trim(), email: email.toLowerCase().trim(), password, role }
      : { email: email.toLowerCase().trim(), password, role };

    try {
      const response = await axios.post(url, payload);
      const { token, user } = response.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      // Navigate based on role
      navigate(user.role === "admin" ? "/admin" : "/");

      // Optional reload for components relying on localStorage
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (error) {
      console.error(`${isSignUp ? "Signup" : "Login"} error:`, error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(", ") ||
                          `${isSignUp ? "Sign up" : "Login"} failed.`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>

      {error && (
        <div className="error-message" style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #ffcccc'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>{isSignUp ? "Register as" : "Login as"}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="author">Author</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Processing..." : (isSignUp ? "Sign Up" : `Login as ${role === "admin" ? "Admin" : "Author"}`)}
        </button>
      </form>

      <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? "Already have an account? Login"
          : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
};

export default Login;
