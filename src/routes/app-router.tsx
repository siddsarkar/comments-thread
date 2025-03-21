import Stories from "@/pages/Stories";
import StoryView from "@/pages/StoryView";
import { createBrowserRouter, RouterProvider } from "react-router";

const routes = createBrowserRouter([
  {
    index: true,
    element: <Stories />,
  },
  {
    path: ":storyId/:commentId?",
    element: <StoryView />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={routes} />;
}
