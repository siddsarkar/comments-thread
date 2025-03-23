import MainLayout from "@/layouts/main-layout";
import Create from "@/pages/Create";
import { ProfileForm } from "@/pages/CreateUser";
import Login from "@/pages/Login";
import Stories from "@/pages/Stories";
import { ExampleComponent } from "@/pages/StoryViewV2";
import { createBrowserRouter, RouterProvider } from "react-router";
import ProtectedRoute from "./protected-route";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        children: [
          {
            index: true,
            element: <Stories />,
          },
          {
            path: "new",
            element: <Create />,
          },
        ],
      },
      {
        path: ":storyId",
        children: [
          {
            path: "new",
            element: <Create />,
          },
          {
            path: ":commentId?",
            element: <ExampleComponent />,
          },
        ],
      },
    ],
  },
  {
    path: "/create-username",
    element: <ProfileForm />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={routes} />;
}
