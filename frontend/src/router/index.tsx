import { createBrowserRouter } from "react-router-dom";
import Landing from "../pages/Landing";
//import Dashboard from "../pages/Dasboard";
import DashBoard from "../dashboard/page";

// 👉 Export hier NICHT vergessen!
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: <DashBoard />,
    children: [
      {
        path: "dashboard",
    //   element: <Dashboard />,
      },
    ],
  }, 
]);
