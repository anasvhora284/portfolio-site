/* eslint-disable react/prop-types */
import { useMediaQuery } from "@mui/material";
import Spline from "@splinetool/react-spline";

const AnimatedBackground = ({ className }) => {
  const isTabletOrMobile = useMediaQuery("(max-width: 1024px)");
  const sceneUrl = isTabletOrMobile
    ? "https://draft.spline.design/MtBvZjI9VvnxbyXY/scene.splinecode"
    : "https://draft.spline.design/vDkt7oWKFj89Qr2q/scene.splinecode";

  return <Spline className={className} scene={sceneUrl} />;
};

export default AnimatedBackground;
