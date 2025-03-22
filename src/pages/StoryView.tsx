import { LinkPreviewImage } from "@/components/link-preview";
import { Separator } from "@/components/ui/separator";
import { alpha, getColorForDepth } from "@/lib/color-utils";
import { formattedDate } from "@/lib/utils";
import { fetchItem } from "@/services/hackernews-api";
import { CommentNode, HNItem } from "@/types/hackernews";
import { decode } from "html-entities";
import {
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Loader2,
  MessageSquare,
  Minus,
  Newspaper,
  Plus,
  User,
} from "lucide-react";
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router";

/**
 * CORE LOGIC
 */

const INITIAL_DEPTH = 3;
const INITIAL_ITEMS_PER_DEPTH = 5;

let total = 1,
  fetched = 0;

type StoryContextType = {
  story: HNItem | null;
  comments: CommentNode[];
  isLoading: boolean;
  isLoadingMore: boolean;
  fetchStory: (storyId: number, commentId?: number) => void;
  onLoadMoreComments: (id: number) => void;
  onLoadMoreTopComments: () => void;
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

async function fetchCommentsUntilStory(
  storyId: number,
  targetCommentId: number
): Promise<CommentNode[]> {
  let comments: CommentNode[] = [];
  let currentCommentId = targetCommentId;

  while (currentCommentId !== storyId) {
    try {
      const item = await fetchItem(currentCommentId);
      const kids = item.kids ?? [];

      comments = [
        {
          ...item,
          children: comments,
          isLoading: false,
          hasMore: kids.length > comments.length,
        },
      ];

      if (!item.parent) break;
      currentCommentId = item.parent;
    } catch (error) {
      console.error(`Failed to fetch comment ${currentCommentId}:`, error);
      break;
    }
  }

  return comments;
}

async function fetchComments(
  commentIds: number[] = [],
  currentDepth: number = 0
): Promise<CommentNode[]> {
  if (currentDepth >= INITIAL_DEPTH) {
    return [];
  }

  const comments = await Promise.all(
    commentIds.slice(0, INITIAL_ITEMS_PER_DEPTH).map(async (id) => {
      try {
        total++;
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
      } finally {
        fetched++;
      }
    })
  );

  return comments;
}

const updateCommentsRecursively = (
  comments: CommentNode[],
  targetId: number,
  newChildren: CommentNode[]
): CommentNode[] => {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return {
        ...comment,
        children: [...comment.children, ...newChildren],
        hasMore:
          (comment.kids?.length || 0) >
          comment.children.length + newChildren.length,
        isLoading: false,
      };
    }
    if (comment.children.length > 0) {
      return {
        ...comment,
        children: updateCommentsRecursively(
          comment.children,
          targetId,
          newChildren
        ),
      };
    }
    return comment;
  });
};

const updateCommentDataRecursively = (
  comments: CommentNode[],
  targetId: number,
  data: Partial<CommentNode>
): CommentNode[] => {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return { ...comment, ...data };
    }
    if (comment.children.length > 0) {
      return {
        ...comment,
        children: updateCommentDataRecursively(
          comment.children,
          targetId,
          data
        ),
      };
    }
    return comment;
  });
};

const findCommentAndDepth = (
  comments: CommentNode[],
  id: number,
  depth: number = 0
): { comment: CommentNode | null; depth: number } => {
  for (const comment of comments) {
    if (comment.id === id) return { comment, depth };
    const found = findCommentAndDepth(comment.children, id, depth + 1);
    if (found.comment) return found;
  }
  return { comment: null, depth: 0 };
};

function StoryProvider({ children }: { children: React.ReactNode }) {
  const [story, setStory] = useState<HNItem | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const loadStoryWithComments = useCallback(
    async (storyId: number, commentId?: number) => {
      if (!storyId) return;

      try {
        const storyData = await fetchItem(storyId);
        setStory(storyData);

        if (commentId) {
          const initialComments = await fetchCommentsUntilStory(
            storyId,
            commentId
          );
          setComments(initialComments);
        } else if (storyData.kids) {
          const initialComments = await fetchComments(storyData.kids);
          setComments(initialComments);
        }
      } catch (error) {
        console.error("Error loading story:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadMoreComments = useCallback(
    async (id: number) => {
      const { comment: targetComment, depth } = findCommentAndDepth(
        comments,
        id
      );

      console.log("Loading more comments for:", targetComment);

      if (!targetComment || !targetComment.kids) return;

      setComments((prevComments) =>
        updateCommentDataRecursively(prevComments, id, { isLoading: true })
      );

      const start = targetComment.children.length;
      const newKids = targetComment.kids.slice(
        start,
        start + INITIAL_ITEMS_PER_DEPTH
      );

      try {
        const newComments = await Promise.all(
          newKids.map(async (id) => {
            const item = await fetchItem(id);
            const children =
              item.kids && depth < INITIAL_DEPTH
                ? await fetchComments(item.kids, depth + 1)
                : [];
            return {
              ...item,
              children,
              isLoading: false,
              hasMore: (item.kids?.length || 0) > children.length,
            } as CommentNode;
          })
        );

        setComments((prevComments) =>
          updateCommentsRecursively(prevComments, id, newComments)
        );
      } catch (error) {
        console.error("Error loading more comments:", error);
      }
    },
    [comments]
  );

  const loadMoreTopComments = useCallback(async () => {
    if (!story || !story.kids || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const newKids = story.kids
        .filter((id) => !comments.some((comment) => comment.id === id))
        .slice(0, INITIAL_ITEMS_PER_DEPTH);

      const newComments = await fetchComments(newKids);
      setComments((prevComments) => [...prevComments, ...newComments]);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [story, comments, isLoadingMore]);

  const value = useMemo(
    () => ({
      story,
      comments,
      isLoading,
      isLoadingMore,
      fetchStory: loadStoryWithComments,
      onLoadMoreComments: loadMoreComments,
      onLoadMoreTopComments: loadMoreTopComments,
    }),
    [
      story,
      comments,
      isLoading,
      isLoadingMore,
      loadMoreComments,
      loadMoreTopComments,
      loadStoryWithComments,
    ]
  );

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}

function useStoryView(storyId: string, { commentId }: { commentId?: string }) {
  const {
    story,
    fetchStory,
    comments,
    isLoading,
    isLoadingMore,
    onLoadMoreComments,
    onLoadMoreTopComments,
  } = useContext(StoryContext)!;

  useEffect(() => {
    fetchStory(Number(storyId), commentId ? Number(commentId) : undefined);
  }, [storyId, commentId, fetchStory]);

  return {
    story,
    comments,
    isLoading,
    isLoadingMore,
    onLoadMoreComments,
    onLoadMoreTopComments,
  };
}

function withStoryContext(Component: React.ComponentType) {
  Component.displayName = "StoryViewWrapper";

  return function StoryViewWrapper() {
    total = 1;
    fetched = 0;
    return (
      <StoryProvider>
        <Component />
      </StoryProvider>
    );
  };
}

/**
 * UI COMPONENTS
 */

const PercentLoader: React.FC = () => {
  const timer = React.useRef<number | null>(null);
  const [dots, setDots] = React.useState("");

  React.useEffect(() => {
    timer.current = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + " "));
    }, 500);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return (
    <span>
      {Math.round((fetched / total) * 10000) / 100} %{dots}
    </span>
  );
};

type StoryProps = {
  story: HNItem;
  onClick?: () => void;
};

const Story: React.FC<StoryProps> = memo((props) => {
  const { story, onClick } = props;

  return (
    <div className="space-y-4">
      <div className="px-4">
        <LinkPreviewImage src={story.url} />
      </div>

      <div className="space-y-1 px-4">
        <h4 className="text-sm font-medium leading-normal">{story.title}</h4>
        <p className="text-sm text-muted-foreground">
          {story.by} • {formattedDate(story.time)}
        </p>
      </div>

      <div>
        <Separator />
        <div className="flex h-12 items-center justify-around space-x-4 text-sm px-4">
          <div>{story.score} points</div>
          <Separator orientation="vertical" />
          <div onClick={onClick} className="cursor-pointer">
            {story.descendants} Comments
          </div>
          <Separator orientation="vertical" />
          <div>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink size={12} /> Source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

Story.displayName = "Story";

type CommentThreadProps = {
  depth: number;
  comment: CommentNode;
  activeCommentId?: number;
  onLoadMore: (commentId: number) => void;
};

function areCommentPropsEqual(
  prevProps: CommentThreadProps,
  nextProps: CommentThreadProps
) {
  return (
    prevProps.comment === nextProps.comment &&
    prevProps.depth === nextProps.depth &&
    prevProps.activeCommentId === nextProps.activeCommentId
  );
}

const CommentThread: React.FC<CommentThreadProps> = memo((props) => {
  const { depth, comment, onLoadMore, activeCommentId } = props;

  const [isExpanded, setIsExpanded] = React.useState(true);

  const containerStyle =
    activeCommentId === comment.id
      ? {
          borderColor: getColorForDepth(depth),
          backgroundColor: "#f5f5",
        }
      : {
          borderColor: getColorForDepth(depth),
          backgroundColor: alpha(getColorForDepth(depth), 0.1),
        };

  if (comment.deleted || comment.dead) {
    return (
      <div className="border-l-4 pl-4 mb-2" style={containerStyle}>
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
    <div className="border-l-4 pl-4 mb-2" style={containerStyle}>
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1 overflow-hidden pr-2">
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
                  : comment.by}{" "}
                {new Date().toISOString()}
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
              <span className="flex items-center gap-1 cursor-pointer text-muted-foreground">
                <MessageSquare size={16} />
                <span>Reply</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              depth={depth + 1}
              onLoadMore={onLoadMore}
              activeCommentId={activeCommentId}
            />
          ))}
          {comment.hasMore && (
            <button
              onClick={() => onLoadMore(comment.id)}
              className="mt-2 pb-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={comment.isLoading}
            >
              {comment.isLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="leading-none">loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <ChevronDown size={16} />
                  <span className="leading-none text-sm">
                    view more replies
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}, areCommentPropsEqual);

CommentThread.displayName = "CommentThread";

const StoryView: React.FC = withStoryContext(() => {
  const { storyId, commentId } = useParams();

  const {
    story,
    comments,
    isLoading,
    isLoadingMore,
    onLoadMoreComments,
    onLoadMoreTopComments,
  } = useStoryView(storyId!, { commentId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PercentLoader />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Story not found</div>
      </div>
    );
  }

  const hasMoreTopComments = story.kids
    ? comments.length < story.kids.length
    : false;

  return (
    <div className="max-w-2xl mx-auto bg-background">
      <header>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-2">
                <Newspaper />
                <h1 className="text-xl font-bold">HNR</h1>
              </div>
            </Link>
            <Link to="/">
              <div className="flex items-center gap-2">
                <ChevronLeft size={16} />
                <h1 className="text-sm">BACK</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div
        className="pt-4"
        style={{ backgroundColor: alpha(getColorForDepth(0), 0.1) }}
      >
        <Story story={story} />
      </div>

      <div className="h-2"></div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              depth={0}
              comment={comment}
              onLoadMore={onLoadMoreComments}
              activeCommentId={Number(commentId)}
            />
          ))}

          {hasMoreTopComments && (
            <div className="pb-4">
              <button
                onClick={onLoadMoreTopComments}
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
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No comments yet
        </p>
      )}
    </div>
  );
});

StoryView.displayName = "StoryView";

export { Story, StoryProvider };
export default StoryView;
