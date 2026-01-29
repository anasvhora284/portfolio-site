import { useState } from "react";
import "./HomePage.css";
import CinematicLoader from "../../components/LoadingScreen/CinematicLoader";
import FloatingLettersHero from "../../components/Home/FloatingLettersHero";
import EdgeNavigation from "../../components/EdgeNavigation/EdgeNavigation";
import CustomCursor from "../../components/CustomCursor/CustomCursor";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cursorMode, setCursorMode] = useState('loading');

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setCursorMode('default');
  };

  return (
    <>
      {isLoading ? (
        <CinematicLoader onComplete={handleLoadingComplete} />
      ) : (
        <>
          <CustomCursor mode={cursorMode} />
          <EdgeNavigation />
          <div className="homepage-container">
            <FloatingLettersHero />
          </div>
        </>
      )}
    </>
  );
};

export default HomePage;
