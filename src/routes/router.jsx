import { createBrowserRouter } from "react-router";
import DashboardLayout from "../layouts/DashboardLayout";
import SellerListPage from "../features/sourcing/pages/SellerListPage";
import { paths } from "../app/paths";
import DashboardHomePage from "../features/dashboard/DashboardHomePage";

export const router = createBrowserRouter([
  {
    path: paths.root,
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: paths.sourcing, element: <SellerListPage /> },
    ],
  },
]);
