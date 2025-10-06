import React from "react";
import Header from "../../components/Header/Header.jsx";
import "./Home.css";
import AboutUs from "../../components/AboutUs/AboutUs.jsx";

const Home = () => {
  return (
    <div className="home-container">
      <Header/>
      <AboutUs/>
      
    </div>
  );
};

export default Home;
