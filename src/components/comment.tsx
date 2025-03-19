import { alpha, getColorForDepth } from "@/lib/color-utils";
import { age, parseLinks } from "@/lib/utils";
import {
  ChevronDown,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  User,
} from "lucide-react";
import React from "react";
import { useParams } from "react-router";
import { CommentNode } from "../types/hackernews";

interface CommentProps {
  comment: CommentNode;
  depth: number;
  onLoadMore: (commentId: number) => void;
}

export function Comment({ comment, depth, onLoadMore }: CommentProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const hasChildren = comment.kids && comment.kids.length > 0;
  const formattedDate = age(new Date(comment.time * 1000));

  const { storyId, commentId } = useParams();

  const activeCommentId = commentId ? parseInt(commentId) : null;

  if (comment.deleted || comment.dead) {
    return (
      <div className="border-l-4 pl-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col flex-1">
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                <div className="flex-shrink-0 py-2">
                  <User size={16} />
                </div>
                <span className="font-medium">[deleted]</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-l-4 pl-4 mb-2"
      style={
        activeCommentId && activeCommentId === comment.id
          ? {
              borderColor: getColorForDepth(depth),
              backgroundColor: "#f5f5",
            }
          : {
              borderColor: getColorForDepth(depth),
              backgroundColor: alpha(getColorForDepth(depth), 0.1),
            }
      }
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
              <div className="flex-shrink-0 py-2">
                <User size={16} />
              </div>
              <span className="font-medium">{comment.by}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>

            {hasChildren && (
              <button className="flex-shrink-0 p-2 rounded">
                {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
              </button>
            )}
          </div>

          {isExpanded && (
            <div className="flex w-full flex-1 max-w-full overflow-hidden">
              <div
                className="mt-1 pr-2 pb-2 text-sm break-before-auto whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: parseLinks(comment.text || ""),
                }}
              />
            </div>
          )}
          {isExpanded && (
            <div className="flex items-center gap-4 pb-2 text-sm">
              {/* <button className="flex items-center gap-1 hover:text-blue-600">
              <ThumbsUp size={16} />
              <span>Upvote</span>
            </button> */}
              <a
                href={`/${storyId}/${comment.id}`}
                // onClick={() => navigate(`/${storyId}/${comment.id}`)}
                className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>Reply</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {isExpanded && comment.children && (
        <div>
          {comment.children.map((child) => (
            <Comment
              key={child.id}
              comment={child}
              depth={depth + 1}
              onLoadMore={onLoadMore}
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
}
