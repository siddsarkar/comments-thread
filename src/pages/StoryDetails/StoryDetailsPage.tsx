import { alpha, getColorForDepth } from "@/lib/color-utils";
import { fetchItem } from "@/services/hackernews-api";
import { useHookstate } from "@hookstate/core";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Comments } from "./components/Comments";
import { Story } from "./components/Story";

const StoryDetailsPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const fetchResource = () => fetchItem(Number(storyId));
  const state = useHookstate(fetchResource);

  const handleCommentClick = useCallback(
    (storyId: number) => {
      navigate(`/${storyId}/new`);
    },
    [navigate]
  );

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
        Failed to load story {storyId}
        <br />
        <code style={{ color: "red" }}>{state.error.toString()}</code>
        <br />
        <button onClick={() => state.set(fetchResource)}>Retry</button>
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-background py-4 space-y-2">
      {/* Loaded
      <br />
      <button onClick={() => state.set(fetchResource)}>Reload</button>
      <br /> */}
      <div
        style={{
          backgroundColor: alpha(getColorForDepth(0), 0.1),
        }}
      >
        <Story story={state.value} onCommentClick={handleCommentClick} />
      </div>
      <div className="space-y-2">
        <Comments kids={state.kids.value ?? []} />
      </div>
      <br />
    </div>
  );
};

export default StoryDetailsPage;
