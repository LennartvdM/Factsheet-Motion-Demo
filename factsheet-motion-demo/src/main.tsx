import { StrictMode, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/view-transitions.css";

const Dashboard = lazy(() => import("./routes/Dashboard"));
const AssetDetails = lazy(() => import("./routes/AssetDetails"));
const Insights = lazy(() => import("./routes/Insights"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading dashboard…</div>}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: "asset/:assetId",
        element: (
          <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading asset…</div>}>
            <AssetDetails />
          </Suspense>
        )
      },
      {
        path: "insights",
        element: (
          <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading insights…</div>}>
            <Insights />
          </Suspense>
        )
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
