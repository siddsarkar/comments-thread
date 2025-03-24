import { alpha, getColorForDepth } from "@/lib/color-utils";
import { formattedDate } from "@/lib/utils";
import { fetchItem } from "@/services/hackernews-api";
import { CommentNode, Item } from "@/types/hackernews";
import { ImmutableObject, State, useHookstate } from "@hookstate/core";
import { decode } from "html-entities";
import {
  ChevronDown,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Story } from "./StoryView";

const INITIAL_DEPTH = 3;
const INITIAL_ITEMS_PER_DEPTH = 5;

async function fetchComments(
  commentIds: readonly number[] = [],
  currentDepth: number = 0
): Promise<CommentNode[]> {
  if (currentDepth >= INITIAL_DEPTH) {
    return [];
  }

  const comments = await Promise.all(
    commentIds.slice(0, INITIAL_ITEMS_PER_DEPTH).map(async (id) => {
      try {
        const item = await fetchItem(id);
        const kids = item.kids ?? [];

        const children =
          kids.length > 0 ? await fetchComments(kids, currentDepth + 1) : [];

        return {
          ...item,
          children,
          isLoading: false,
          hasMore: kids.length > children.length,
        } as CommentNode;
      } catch (error) {
        console.error(`Failed to fetch comment ${id}:`, error);
        return {
          id,
          text: "Failed to load comment.",
          children: [],
          isLoading: false,
          hasMore: false,
          time: 0,
          by: "Unknown",
          type: "comment",
          url: "",
        } as CommentNode;
      }
    })
  );

  return comments;
}

export const ExampleComponent = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();

  const fetchResource = () => fetchItem(Number(storyId));
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
        <Story
          story={state.value as Item}
          onClick={() => {
            navigate(`/${storyId}/new`);
          }}
        />
      </div>
      <StoryComments kids={state.value.kids ?? []} />
      <br />
    </div>
  );
};

function NodeComment(props: { nameState: State<CommentNode>; depth: number }) {
  const state = useHookstate(props.nameState);
  const [isExpanded, setIsExpanded] = useState(true);

  const comment = state.get();

  if (comment.deleted || comment.dead) {
    return (
      <div className="pl-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <div className="flex-shrink-0 py-2">
              <User size={16} />
            </div>
            <span className="font-medium">
              {comment.deleted
                ? "[deleted]"
                : comment.dead
                ? "[dead]"
                : comment.by}
            </span>
            <span>•</span>
            <span>{formattedDate(comment.time)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pl-4"
      // className="pl-4 mb-2"
      style={{
        // borderLeftWidth: props.depth > 0 ? 1 : 0,
        // borderColor: getColorForDepth(props.depth),
        backgroundColor: alpha(getColorForDepth(props.depth), 0.1),
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
              <div className="flex-shrink-0 py-2">
                <User size={16} />
              </div>
              <span className="font-medium">
                {comment.deleted
                  ? "[deleted]"
                  : comment.dead
                  ? "[dead]"
                  : comment.by}
                {/* {new Date().toISOString()} */}
              </span>
              <span>•</span>
              <span>{formattedDate(comment.time)}</span>
            </div>

            <button className="flex-shrink-0 p-2 rounded">
              {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {isExpanded && (
            <div className="flex w-full flex-1 max-w-full overflow-hidden">
              <div
                className="mt-1 pr-2 pb-2 text-sm prose dark:prose-invert max-w-full prose-a:no-underline prose-a:text-lime-200"
                dangerouslySetInnerHTML={{
                  __html: decode(comment.text || ""),
                }}
              />
            </div>
          )}
          {isExpanded && (
            <div className="flex items-center gap-4 pb-2 text-sm">
              <Link to={`/${comment.id}/new`} className="text-muted-foreground">
                <span className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <MessageSquare size={16} />
                  <span>reply</span>
                  {/* <NodeByEditor nameState={state.by} /> */}
                </span>
              </Link>
            </div>
          )}

          {isExpanded && (
            <>
              <NodeCommentsEditor
                nodes={state.children}
                depth={props.depth + 1}
              />
              <NodeLoadMoreButton node={state} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeLoadMoreButton(props: { node: State<CommentNode> }) {
  const state = useHookstate(props.node);

  if (!state.hasMore.get()) {
    return null;
  }

  return (
    <div style={{ paddingLeft: 20 }}>
      <button
        onClick={() => {
          const kids = state.kids.get() ?? [];
          const start = state.children.get().length;

          state.isLoading.set(true);

          fetchComments(
            (kids ?? []).slice(start, start + INITIAL_ITEMS_PER_DEPTH)
          ).then((comments) => {
            state.isLoading.set(false);
            state.children.set((node) => {
              if (!node) {
                return comments;
              }
              return node.concat(comments);
            });

            state.hasMore.set(kids.length > start + comments.length);
          });
        }}
        className="mt-2 pb-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
        disabled={state.isLoading.get()}
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
}

function NodeCommentsEditor(props: {
  nodes: State<CommentNode[]>;
  depth?: number;
}) {
  const { depth = 0 } = props;
  const state = useHookstate(props.nodes);

  return (
    <div className="space-y-2">
      {state.ornull &&
        state.ornull.map((nodeState: State<CommentNode>, i) => (
          <div key={i} className="space-y-2">
            <NodeComment nameState={nodeState} depth={depth} />
          </div>
        ))}
    </div>
  );
}

function StoryComments({ kids }: { kids: ImmutableObject<number[]> }) {
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
      <NodeCommentsEditor nodes={state} />
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
}
