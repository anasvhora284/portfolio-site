import { useState } from "react";
import "./HomePage.css";
import Layout from "../../components/Layout/Layout";
import HeroSection from "../../components/Home/HeroSection";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <Layout>
        <div className="homepage-container">
          <HeroSection />
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
