import { alpha, getColorForDepth } from "@/lib/color-utils";
import { Story } from "@/pages/StoryView";
import { fetchItem, fetchTopStories } from "@/services/hackernews-api";
import { HNItem } from "@/types/hackernews";
import { ChevronDown, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

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
  const navigate = useNavigate();

  const [storyIds, setStoryIds] = useState<number[]>([]);
  const [stories, setStories] = useState<HNItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function loadInitialStories() {
      try {
        const topStoryIds = await fetchTopStories();
        const topStories = await fetchStories(topStoryIds);

        setStoryIds(topStoryIds);
        setStories(topStories);

        if (topStories.length < INITIAL_ITEMS) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading story:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialStories();
  }, []);

  async function onLoadMore() {
    setIsLoadingMore(true);

    try {
      const remainingStoryIds = storyIds.slice(stories.length);
      const remainingStories = await fetchStories(remainingStoryIds);

      setStories((prevStories) => [...prevStories, ...remainingStories]);

      if (remainingStories.length < INITIAL_ITEMS) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more stories:", error);
    }

    setIsLoadingMore(false);
  }

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
    <div className="max-w-2xl mx-auto">
      <header>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-2">
                <Newspaper />
                <h1 className="text-xl font-bold">HNR</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="pt-4"
            style={{ backgroundColor: alpha(getColorForDepth(0), 0.1) }}
          >
            <Story story={story} onClick={() => navigate(`/${story.id}`)} />
          </div>
        ))}

        {hasMore && (
          <div className="pb-4">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoadingMore ? (
                <span className="text-sm">Loading more comments...</span>
              ) : (
                <div className="flex items-center gap-1">
                  <ChevronDown size={16} />
                  <span className="text-sm">Load more</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stories;
