/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/no-unknown-property */
import "./HomePage.css";
import YellowBgHome from "../../assets/Images/yellow-bg.svg";
import AnimatedBackground from "./../../components/AnimatedBG/Background";
import Layout from "../../components/Layout/Layout";
import HomePageInfo from "./../../components/HomePageInfo/HomePageInfo";
import { useEffect } from "react";

const HomePage = () => {
  useEffect(() => {
    const htmlEl = document.getElementsByTagName("html")[0];
    htmlEl.style.overflowX = "hidden";

    return () => {
      htmlEl.style.overflowX = "auto";
    };
  }, []);

  return (
    <Layout>
      <div className="HomepageMainContainer">
        <div className="ImagesContainer">
          <img src={YellowBgHome} alt="YellowBg" className="YellowBgSvg" />
          <AnimatedBackground className="SplineScene" />
        </div>
        <HomePageInfo className="HomePageInfo" />
      </div>
    </Layout>
  );
};

export default HomePage;
