import Stories from "@/pages/Stories";
import StoryView from "@/pages/StoryView";
import { BrowserRouter, Route, Routes } from "react-router";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Stories />} />
        <Route path="/:storyId/:commentId?" element={<StoryView />} />
      </Routes>
    </BrowserRouter>
  );
}
