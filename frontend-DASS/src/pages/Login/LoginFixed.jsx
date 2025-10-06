import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginFixed.css";

const LoginFixed = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "author",
  });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    setError("");
    
    if (isSignUp && (!formData.name || formData.name.trim().length < 2)) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (isSignUp && !formData.role) {
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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        if (response.data.requiresVerification) {
          setVerificationData({ email: formData.email, otp: "" });
          setShowEmailVerification(true);
          setSuccess("Registration successful! Please check your email for verification code.");
        } else {
          setSuccess("Registration successful! You can now login.");
          setIsSignUp(false);
        }
      } else {
        // Handle system admin login separately
        if (formData.role === 'system_admin') {
          const res = await axios.post('http://localhost:5000/sysadmin/login', {
            email: formData.email,
            password: formData.password
          });
          localStorage.setItem('sysadminToken', res.data.sysadminToken);
          localStorage.setItem('userRole', 'system_admin');
          localStorage.setItem('isLoggedIn', 'true');
          window.dispatchEvent(new Event('auth-changed'));
          setSuccess('System Admin login successful');
          setTimeout(() => {
            navigate('/system-admin');
          }, 300);
          return;
        }

        const response = await axios.post("http://localhost:5000/users/login", {
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        if (response.data.requiresVerification) {
          setVerificationData({ email: formData.email, otp: "" });
          setShowEmailVerification(true);
          setError("Please verify your email first.");
        } else {
          // Normal user/admin login
          if (formData.role !== 'system_admin') {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", response.data.user.name);
            localStorage.setItem("userEmail", response.data.user.email);
            localStorage.setItem("userRole", response.data.user.role);
            window.dispatchEvent(new Event("auth-changed"));
            setSuccess("Login successful!");
            setTimeout(() => {
              navigate("/dashboard");
            }, 300);
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
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
      setFormData({ name: "", email: verificationData.email, password: "", role: "author" });
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
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>📧 Email Verification</h2>
            <p>Please enter the verification code sent to</p>
            <p className="email-display">{verificationData.email}</p>
          </div>
          
          <form onSubmit={handleEmailVerification} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={verificationData.otp}
                onChange={(e) => setVerificationData(prev => ({ ...prev, otp: e.target.value }))}
                maxLength="6"
                required
                className="otp-input"
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            
            <div className="auth-actions">
              <button 
                type="button" 
                onClick={handleResendVerification}
                disabled={loading}
                className="secondary-button"
              >
                Resend Code
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowEmailVerification(false)}
                className="secondary-button"
              >
                Back to Login
              </button>
            </div>
          </form>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🔒 Reset Password</h2>
            {!forgotPasswordData.otp ? (
              <p>Enter your email address to receive a reset code</p>
            ) : (
              <p>Enter the code and your new password</p>
            )}
          </div>
          
          {!forgotPasswordData.otp ? (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="secondary-button"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={forgotPasswordData.otp}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, otp: e.target.value }))}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  placeholder="New Password"
                  value={forgotPasswordData.newPassword}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={forgotPasswordData.confirmPassword}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="secondary-button"
              >
                Back to Login
              </button>
            </form>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p>{isSignUp ? "Sign up to start submitting research papers" : "Sign in to your account"}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {isSignUp && (
            <div className="input-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Role</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {/* System Admin Login (no signup) */}
          {!isSignUp && (
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: 6 }}>Login as</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="author">Author</option>
                <option value="admin">Admin</option>
                <option value="system_admin">System Admin</option>
              </select>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>
        
        <div className="auth-actions">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="toggle-button"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignUp && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-button"
            >
              Forgot Password?
            </button>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default LoginFixed;

