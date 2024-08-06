import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage.jsx";
import AboutUsPage from "./pages/AboutUsPage/AboutUsPage.jsx";
import ContactPage from "./pages/ContactPage/ContactPage";
import ProjectsPage from "./pages/ProjectsPage/ProjectsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  {
    path: "/home",
    element: <HomePage location="/home" />,
  },
  {
    path: "/about",
    element: <AboutUsPage location="/about" />,
  },
  {
    path: "/contact",
    element: <ContactPage location="/contact" />,
  },
  {
    path: "/projects",
    element: <ProjectsPage location="/projects" />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
