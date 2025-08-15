import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CanvasPage } from "@/pages/canvas/index.tsx";
import { TestPage } from "@/pages/test";
const router = createBrowserRouter([
  {
    path: "/",
    element: <CanvasPage />,
  },
  {
    path: "/test",
    element: <TestPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
