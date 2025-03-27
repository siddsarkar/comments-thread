import { Loadable } from "@/components/loadable";
import { MainLayout } from "@/layouts/main-layout";
// import { ProfileForm } from "@/pages/CreateUser";
// import { Profile } from "@/pages/Profile";
// import { StoryDetailsPage } from "@/pages/StoryDetails/StoryDetailsPage";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ProtectedRoute } from "./protected-route";

const StoriesPage = Loadable(() => import("@/pages/Stories"));
const StoryDetailsPage = Loadable(
  () => import("@/pages/StoryDetails/StoryDetailsPage")
);
const CreateItemPage = Loadable(() => import("@/pages/Create"));
const LoginPage = Loadable(() => import("@/pages/Login"));
const ProfilePage = Loadable(() => import("@/pages/Profile"));
const UserOnboardingPage = Loadable(() => import("@/pages/CreateUser"));

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
            element: <StoriesPage />,
          },
          {
            path: "new",
            element: <CreateItemPage key="new-story" />,
          },
          {
            path: "profile",
            children: [
              {
                index: true,
                element: <ProfilePage key="profile" />,
              },
              {
                path: ":uid",
                element: <ProfilePage key="uid-profile" />,
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
            element: <CreateItemPage key="new-reply" />,
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
    element: <UserOnboardingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={routes} />;
}
