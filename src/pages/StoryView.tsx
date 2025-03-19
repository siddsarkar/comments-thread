import { ArrowLeft, ChevronDown, Newspaper } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Comment } from "../components/comment";
import { Story } from "../components/story";
import { fetchItem } from "../services/hackernews-api";
import { CommentNode, HNItem } from "../types/hackernews";

const INITIAL_DEPTH = 5;
const INITIAL_ITEMS_PER_DEPTH = 5;

/**
 * we have to fetch the comment first and then keep fetching its parent until we reach the story,
 * while maintaining the tree structure of the comments
 */
async function fetchCommentsUntilComment(
  storyId: number,
  targetCommentId: number
): Promise<CommentNode[]> {
  let comments: CommentNode[] = [];
  let currentCommentId = targetCommentId;

  while (currentCommentId !== storyId) {
    const item = await fetchItem(currentCommentId);
    // const children = item.kids ? await fetchComments(item.kids, 0) : [];
    comments = [
      {
        ...item,
        children: comments,
        isLoading: false,
        hasMore: (item.kids?.length || 0) > comments.length,
      },
    ];

    if (!item.parent) break;
    currentCommentId = item.parent;
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
      const item = await fetchItem(id);
      const children = item.kids
        ? await fetchComments(item.kids, currentDepth + 1)
        : [];
      return {
        ...item,
        children,
        isLoading: false,
        hasMore: (item.kids?.length || 0) > children.length,
      } as CommentNode;
    })
  );
  return comments;
}

function StoryView() {
  const { storyId, commentId } = useParams();

  const [story, setStory] = useState<HNItem | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function loadInitialStory() {
      if (!storyId) return;

      try {
        const storyIdInt = parseInt(storyId);
        const storyData = await fetchItem(storyIdInt);
        setStory(storyData);

        if (commentId) {
          const commentIdInt = parseInt(commentId);
          const initialComments = await fetchCommentsUntilComment(
            storyIdInt,
            commentIdInt
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
    }

    loadInitialStory();
  }, [storyId, commentId]);

  const handleLoadMoreComments = async (id: number) => {
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

    const { comment: targetComment, depth } = findCommentAndDepth(comments, id);

    console.log("found comment and depth", targetComment, depth);
    if (!targetComment || !targetComment.kids) return;

    // Update loading state
    console.log("loading more comments for", comments);
    setComments(
      updateCommentDataRecursively(comments, id, { isLoading: true })
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
  };

  const handleLoadMoreTopComments = async () => {
    if (!story || !story.kids || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const start = comments.length;
      const newKids = story.kids.slice(start, start + INITIAL_ITEMS_PER_DEPTH);

      const newComments = await fetchComments(newKids);
      setComments((prevComments) => [...prevComments, ...newComments]);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No story found</div>
      </div>
    );
  }

  const hasMoreTopComments = story.kids
    ? comments.length < story.kids.length
    : false;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <header className="shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="text-blue-600" />
              <h1 className="text-xl font-bold">HN Reader</h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-2 py-4 rounded">
        <Story story={story} />
      </div>

      {comments.length > 0 ? (
        <>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              depth={0}
              onLoadMore={handleLoadMoreComments}
            />
          ))}
          {hasMoreTopComments && (
            <button
              onClick={handleLoadMoreTopComments}
              disabled={isLoadingMore}
              className="mt-6 w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 bg-foreground/10 hover:bg-foreground/20"
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
          )}
        </>
      ) : (
        <p>No comments yet</p>
      )}
    </div>
  );
}

export default memo(StoryView);
