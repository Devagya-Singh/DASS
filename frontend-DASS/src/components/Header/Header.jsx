import React, { useMemo } from "react";
import "./Header.css";

const Header = () => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }, []);
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">{greeting}, welcome to</h1>
        <h2 className="hero-subtitle">Dynamic Academic Submission System</h2>
        <p className="hero-description">
          The all-in-one platform for managing research submissions and conferences
        </p>
        <a href="#features" className="hero-button">Explore Features</a>
      </div>
    </section>
  );
};

export default Header;