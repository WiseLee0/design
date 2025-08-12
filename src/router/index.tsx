import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CanvasPage } from "@/pages/canvas/index.tsx";
import { BenchmarkPage } from "@/pages/benchmark";
const router = createBrowserRouter([
  {
    path: "/",
    element: <CanvasPage />,
  },
  {
    path: "/benchmark",
    element: <BenchmarkPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
