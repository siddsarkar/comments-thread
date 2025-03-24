import { fetchItem } from "@/services/hackernews-api";
import { CommentNode } from "@/types/hackernews";

export const INITIAL_DEPTH = 3;
export const INITIAL_ITEMS_PER_DEPTH = 5;

export async function fetchComments(
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
