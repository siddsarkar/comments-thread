import Stories from "@/pages/Stories";
import { ExampleComponent } from "@/pages/StoryViewV2";
import { createBrowserRouter, RouterProvider } from "react-router";

const routes = createBrowserRouter([
  {
    index: true,
    element: <Stories />,
  },
  {
    path: ":storyId/:commentId?",
    element: <ExampleComponent />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={routes} />;
}
