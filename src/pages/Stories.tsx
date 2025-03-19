import { Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Story } from "../components/story";
import { fetchItem, fetchTopStories } from "../services/hackernews-api";
import { HNItem } from "../types/hackernews";

const INITIAL_ITEMS = 10;

async function fetchStories(storyIds: number[] = []): Promise<HNItem[]> {
  const stories = await Promise.all(
    storyIds.slice(0, INITIAL_ITEMS).map(async (id) => {
      const item = await fetchItem(id);

      return item as HNItem;
    })
  );
  return stories;
}

function Stories() {
  const [stories, setStories] = useState<HNItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadInitialStories() {
      try {
        const topStoryIds = await fetchTopStories();
        const topStories = await fetchStories(topStoryIds);

        setStories(topStories);
      } catch (error) {
        console.error("Error loading story:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialStories();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No stories found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="text-blue-600" />
              <h1 className="text-xl font-bold">HN Reader</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {stories.map((story) => (
          <div key={story.id} className="bg-muted-foreground/5 p-4 rounded">
            <Story story={story} onClick={() => navigate(`/${story.id}`)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stories;
