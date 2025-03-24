import { ImmutableArray, useHookstate } from "@hookstate/core";
import { ChevronDown } from "lucide-react";
import { memo } from "react";
import { fetchComments, INITIAL_ITEMS_PER_DEPTH } from "../lib/fetchUtils";
import { CommentThread } from "./CommentThread";

const isKidsEqual = (
  preProps: { kids: ImmutableArray<number> },
  nextProps: { kids: ImmutableArray<number> }
) => {
  return preProps.kids === nextProps.kids;
};

export const Comments = memo(({ kids }: { kids: ImmutableArray<number> }) => {
  const fetchResource = () => fetchComments(kids);

  const state = useHookstate(fetchResource);
  const loadingMoreState = useHookstate(false);

  if (state.promised) {
    return (
      <div className="min-h-auto flex items-center justify-center p-4 text-sm">
        <div>Loading...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <p>
        Failed to load comments
        <br />
        <code style={{ color: "red" }}>{state.error.toString()}</code>
        <br />
        <button onClick={() => state.set(fetchResource)}>Retry</button>
      </p>
    );
  }

  const hasMore = state.length < kids.length;

  return (
    <>
      {/* <h2>Comments loaded</h2>
      Loaded
      <br />
      <button onClick={() => state.set(fetchResource)}>Reload</button>
      <br /> */}
      <CommentThread nodes={state} />
      {hasMore && (
        <div className="pb-4">
          <button
            onClick={() => {
              loadingMoreState.set(true);
              const newKids = kids
                .filter(
                  (id) => !state.some((comment) => comment.id.get() === id)
                )
                .slice(0, INITIAL_ITEMS_PER_DEPTH);

              fetchComments(newKids)
                .then((comments) => {
                  state.set((node) => {
                    if (!node) {
                      return comments;
                    }
                    return node.concat(comments);
                  });
                })
                .finally(() => {
                  loadingMoreState.set(false);
                });
            }}
            disabled={loadingMoreState.get()}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingMoreState.get() ? (
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
    </>
  );
}, isKidsEqual);
