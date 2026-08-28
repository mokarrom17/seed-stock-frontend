import { createBrowserRouter } from "react-router";
import DashboardLayout from "../layouts/DashboardLayout";
import SellerListPage from "../features/sourcing/pages/SellerListPage";
import { paths } from "../app/paths";
import DashboardHomePage from "../features/dashboard/DashboardHomePage";
import StockDryingPage from "../features/stock/pages/StockDryingPage";
import PackagingPage from "../features/packaging/pages/PackagingPage";

export const router = createBrowserRouter([
  {
    path: paths.root,
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: paths.sourcing, element: <SellerListPage /> },
      { path: paths.stock, element: <StockDryingPage /> },
      {
        path: paths.packaging,
        element: <PackagingPage />,
      },
    ],
  },
]);
