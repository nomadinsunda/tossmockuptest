import { createBrowserRouter } from "react-router-dom";
import CheckoutPage from "@/pages/CheckoutPage";
import SuccessPage from "@/pages/SuccessPage";
import FailPage from "@/pages/FailPage";

export const router = createBrowserRouter([
  { path: "/", element: <CheckoutPage /> },
  { path: "/success", element: <SuccessPage /> },
  { path: "/fail", element: <FailPage /> },
]);
