import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const LoginEnhanced = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("author");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    email: "",
    otp: ""
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
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
    
    if (isSignUp && !role) {
      setError("Please select a role");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (isSignUp) {
        const response = await axios.post("http://localhost:5000/users/register", {
          name: fullName,
          email,
          password,
          role
        });
        
        if (response.data.requiresVerification) {
          setVerificationData({ email, otp: "" });
          setShowEmailVerification(true);
          setSuccess("Registration successful! Please check your email for verification code.");
        } else {
          setSuccess("Registration successful! You can now login.");
          setIsSignUp(false);
        }
      } else {
        const response = await axios.post("http://localhost:5000/users/login", {
          email,
          password,
          role
        });
        
        if (response.data.requiresVerification) {
          setVerificationData({ email, otp: "" });
          setShowEmailVerification(true);
          setError("Please verify your email first.");
        } else {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userName", response.data.user.name);
          localStorage.setItem("userEmail", response.data.user.email);
          localStorage.setItem("userRole", response.data.user.role);
          
          setSuccess("Login successful!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:5000/users/verify-email", {
        email: verificationData.email,
        otp: verificationData.otp
      });
      
      setSuccess("Email verified successfully! You can now login.");
      setShowEmailVerification(false);
      setIsSignUp(false);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    
    try {
      await axios.post("http://localhost:5000/users/resend-verification", {
        email: verificationData.email
      });
      setSuccess("Verification email sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await axios.post("http://localhost:5000/users/forgot-password", {
        email: forgotPasswordData.email
      });
      setSuccess("Password reset email sent! Please check your email for OTP.");
      setForgotPasswordData(prev => ({ ...prev, otp: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    try {
      await axios.post("http://localhost:5000/users/reset-password", {
        email: forgotPasswordData.email,
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword
      });
      
      setSuccess("Password reset successfully! You can now login.");
      setShowForgotPassword(false);
      setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>📧 Email Verification</h2>
          <p>Please enter the verification code sent to <strong>{verificationData.email}</strong></p>
          
          <form onSubmit={handleEmailVerification}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={verificationData.otp}
              onChange={(e) => setVerificationData(prev => ({ ...prev, otp: e.target.value }))}
              maxLength="6"
              required
            />
            
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            
            <button 
              type="button" 
              onClick={handleResendVerification}
              disabled={loading}
              className="resend-btn"
            >
              Resend Code
            </button>
            
            <button 
              type="button" 
              onClick={() => setShowEmailVerification(false)}
              className="back-btn"
            >
              Back to Login
            </button>
          </form>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>🔒 Reset Password</h2>
          
          {!forgotPasswordData.otp ? (
            <form onSubmit={handleForgotPassword}>
              <p>Enter your email address to receive a reset code</p>
              <input
                type="email"
                placeholder="Email address"
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="back-btn"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <p>Enter the code sent to <strong>{forgotPasswordData.email}</strong> and your new password</p>
              
              <input
                type="text"
                placeholder="Enter OTP"
                value={forgotPasswordData.otp}
                onChange={(e) => setForgotPasswordData(prev => ({ ...prev, otp: e.target.value }))}
                required
              />
              
              <input
                type="password"
                placeholder="New Password"
                value={forgotPasswordData.newPassword}
                onChange={(e) => setForgotPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              
              <input
                type="password"
                placeholder="Confirm New Password"
                value={forgotPasswordData.confirmPassword}
                onChange={(e) => setForgotPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              
              <button type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="back-btn"
              >
                Back to Login
              </button>
            </form>
          )}
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
        
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {isSignUp && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </select>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Login")}
          </button>
        </form>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="toggle-btn"
          >
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignUp && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-btn"
            >
              Forgot Password?
            </button>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  );
};

export default LoginEnhanced;

