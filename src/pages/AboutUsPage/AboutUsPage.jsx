/* eslint-disable react/no-unescaped-entities */
import Layout from "./../../components/Layout/Layout";
import AboutUsMyImg from "../../assets/Images/AboutUsImage.svg";
import AboutUsPageInfo from "./../../components/AboutUsPageInfo/AboutUsPageInfo";
import "./AboutUsPage.css";

const AboutUsPage = () => {
  return (
    <Layout>
      <div className="AboutUsPageMainDiv">
        <AboutUsPageInfo />
        <div className="AboutUsImage">
          <img src={AboutUsMyImg} alt="MyImage" />
        </div>
      </div>
    </Layout>
  );
};

export default AboutUsPage;
