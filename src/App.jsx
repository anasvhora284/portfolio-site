import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import UniverseShell from "./universe/UniverseShell.jsx";

const router = createBrowserRouter([
  { path: "/", element: <UniverseShell /> },
  { path: "/work/:slug", element: <UniverseShell /> },
  { path: "/about", element: <UniverseShell /> },
  { path: "/contact", element: <UniverseShell /> },
  { path: "/home", element: <Navigate to="/" replace /> },
  { path: "/projects", element: <Navigate to="/" replace /> },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
