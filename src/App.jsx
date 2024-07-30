import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage.jsx";
import AboutUsPage from "./pages/AboutUsPage/AboutUsPage.jsx";
import ContactPage from "./pages/ContactPage/ContactPage";

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
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
