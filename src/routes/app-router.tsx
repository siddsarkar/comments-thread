import MainLayout from "@/layouts/main-layout";
import Create from "@/pages/Create";
import { ProfileForm } from "@/pages/CreateUser";
import Login from "@/pages/Login";
import { Profile } from "@/pages/Profile";
import { TopStories } from "@/pages/Stories";
import { StoryDetailsPage } from "@/pages/StoryDetails/StoryDetailsPage";
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
            element: <TopStories />,
          },
          {
            path: "new",
            element: <Create key="new-post" />,
          },
          {
            path: "profile",
            children: [
              {
                index: true,
                element: <Profile key="profile" />,
              },
              {
                path: ":uid",
                element: <Profile key="uid-profile" />,
              },
            ],
          },
        ],
      },
      {
        path: ":storyId",
        children: [
          {
            path: "new",
            element: <Create key="new-reply" />,
          },
          {
            path: ":commentId?",
            element: <StoryDetailsPage />,
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
