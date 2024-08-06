/* eslint-disable react/no-unescaped-entities */
import Layout from "./../../components/Layout/Layout";
import AboutUsPageInfo from "./../../components/AboutUsPageInfo/AboutUsPageInfo";
import "./AboutUsPage.css";

const AboutUsPage = () => {
  return (
    <Layout>
      <div className="AboutUsPageMainDiv">
        <AboutUsPageInfo />
      </div>
    </Layout>
  );
};

export default AboutUsPage;
