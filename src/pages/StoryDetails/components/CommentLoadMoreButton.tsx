import { CommentNode } from "@/types/hackernews";
import { State, useHookstate } from "@hookstate/core";
import { ChevronDown, Loader2 } from "lucide-react";
import { fetchComments } from "../lib/fetchUtils";

export const CommentLoadMoreButton = (props: { node: State<CommentNode> }) => {
  const state = useHookstate(props.node);

  const fetchMoreComments = () => {
    const kids = state.kids.get() ?? [];
    const start = state.children.get().length;
    const newKids = kids.slice(start);

    state.isLoading.set(true);

    fetchComments(newKids)
      .then((comments) => {
        state.children.set((prev) => {
          if (!prev) {
            return comments;
          }

          return prev.concat(comments);
        });

        state.hasMore.set(kids.length > start + comments.length);
      })
      .finally(() => {
        state.isLoading.set(false);
      });
  };

  if (!state.hasMore.get()) {
    return null;
  }

  return (
    <div style={{ paddingLeft: 20 }}>
      <button
        disabled={state.isLoading.get()}
        onClick={fetchMoreComments}
        className="mt-2 pb-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {state.isLoading.get() ? (
          <div className="flex items-center gap-1">
            <Loader2 size={16} className="animate-spin" />
            <span className="leading-none">loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <ChevronDown size={16} />
            <span className="leading-none text-sm">view more replies</span>
          </div>
        )}
      </button>
    </div>
  );
};
