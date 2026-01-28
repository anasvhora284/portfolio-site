import Layout from "../../components/Layout/Layout";
import AboutHeader from "../../components/About/AboutHeader";
import Timeline from "../../components/About/Timeline";
import SkillsGrid from "../../components/About/SkillsGrid";
import PersonalStatement from "../../components/About/PersonalStatement";
import ResumeSection from "../../components/About/ResumeSection";
import "./AboutUsPage.css";

const AboutUsPage = () => {
  return (
    <Layout>
      <div className="about-page-container">
        <AboutHeader />
        <Timeline />
        <SkillsGrid />
        <PersonalStatement />
        <ResumeSection />
      </div>
    </Layout>
  );
};

export default AboutUsPage;
