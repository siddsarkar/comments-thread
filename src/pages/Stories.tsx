import { alpha, getColorForDepth } from "@/lib/color-utils";
// import { Story } from "@/pages/StoryView";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { fetchItem, fetchTopStories } from "@/services/hackernews-api";
import { Item } from "@/types/hackernews";
import { suspend, useHookstate } from "@hookstate/core";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Story } from "./StoryDetails/components/Story";

const INITIAL_ITEMS = 2;

async function fetchStories(storyIds: number[] = []): Promise<Item[]> {
  const stories = await Promise.all(
    storyIds.slice(0, INITIAL_ITEMS).map(async (id) => {
      const item = await fetchItem(id);
      return item as Item;
    })
  );
  return stories;
}

function Stories({ storyIds }: { storyIds: number[] }) {
  const navigate = useNavigate();

  const fetchResource = () => fetchStories(storyIds);
  const storiesState = useHookstate(fetchResource);

  const hasMoreState = useHookstate(storyIds.length > INITIAL_ITEMS);
  const isLoadingMoreState = useHookstate(false);

  const [setElement] = useInfiniteScroll(() => {
    if (hasMoreState.get() && !isLoadingMoreState.get()) {
      onLoadMore();
    }
  });

  async function onLoadMore() {
    console.log("Loading more stories...");

    isLoadingMoreState.set(true);

    try {
      const remainingStoryIds = storyIds.slice(storiesState.value.length);
      const remainingStories = await fetchStories(remainingStoryIds);

      storiesState.set((stories) => stories.concat(remainingStories));

      if (remainingStories.length < INITIAL_ITEMS) {
        hasMoreState.set(false);
      }
    } catch (error) {
      console.error("Error loading more stories:", error);
    }

    isLoadingMoreState.set(false);
  }

  const handleStoryClick = useCallback(
    (storyId: number) => {
      navigate(`/${storyId}`);
    },
    [navigate]
  );

  if (storiesState.promised) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (storiesState.error) {
    return (
      <p>
        Failed to load stories
        <br />
        <code style={{ color: "red" }}>{storiesState.error.toString()}</code>
        <br />
        <button onClick={() => storiesState.set(fetchResource)}>Retry</button>
      </p>
    );
  }

  // if (!storiesState.value.length) {
  //   return (
  //     <div className="max-w-2xl mx-auto">
  //       <header>
  //         <div className="max-w-4xl mx-auto px-4 py-4">
  //           <div className="flex items-center justify-between">
  //             <div className=""></div>
  //             {/* <Link to="/">
  //               <div className="flex items-center gap-2">
  //                 <Newspaper />
  //                 <h1 className="text-xl font-bold">HNR</h1>
  //               </div>
  //             </Link> */}
  //             <Link to="/new">
  //               <div className="flex items-center gap-2">
  //                 <Plus />
  //               </div>
  //             </Link>
  //           </div>
  //         </div>
  //       </header>

  //       <div className="flex items-center justify-center p-16">
  //         <div>No stories found</div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-2xl mx-auto">
      <header>
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* <div className="flex items-center justify-between">
            <div className=""></div>
            <Link to="/">
              <div className="flex items-center gap-2">
                <Newspaper />
                <h1 className="text-xl font-bold">HNR</h1>
              </div>
            </Link>
            <Link to="/new">
              <div className="flex items-center gap-2">
                <Plus />
              </div>
            </Link>
          </div> */}
        </div>
      </header>

      <div className="space-y-4 pb-16">
        {suspend(storiesState) ||
          storiesState.map((story) => (
            <div
              key={story.id.value}
              className="pt-4"
              style={{ backgroundColor: alpha(getColorForDepth(0), 0.1) }}
            >
              <Story story={story.value} onCommentClick={handleStoryClick} />
            </div>
          ))}

        {hasMoreState.get() ? (
          <div className="pb-4">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMoreState.get()}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoadingMoreState.get() && (
                <span className="text-sm">Loading more comments...</span>
              )}
            </button>
          </div>
        ) : (
          <div className="pb-4 flex justify-center items-center gap-2">
            <span className="text-sm text-gray-500">No more stories</span>
          </div>
        )}

        {!isLoadingMoreState.get() && <div ref={setElement} className="pb-4" />}
      </div>
    </div>
  );
}

export default function TopStories() {
  const fetchResource = () => fetchTopStories();
  const state = useHookstate(fetchResource);

  if (state.promised) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <p>
        Failed to load top stories
        <br />
        <code style={{ color: "red" }}>{state.error.toString()}</code>
        <br />
        <button onClick={() => state.set(fetchResource)}>Retry</button>
      </p>
    );
  }

  return <Stories storyIds={state.value.map((id) => id)} />;
}
