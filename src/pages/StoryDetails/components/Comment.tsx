import { alpha, getColorForDepth } from "@/lib/color-utils";
import { formattedDate } from "@/lib/utils";
import { CommentNode } from "@/types/hackernews";
import { State, useHookstate } from "@hookstate/core";
import { decode } from "html-entities";
import { MessageSquare, Minus, Plus, User } from "lucide-react";
import { Link } from "react-router";
import { CommentLoadMoreButton } from "./CommentLoadMoreButton";
import { CommentThread } from "./CommentThread";

export const Comment = (props: {
  nameState: State<CommentNode>;
  depth: number;
}) => {
  const state = useHookstate(props.nameState);
  const expandedSate = useHookstate(true);

  if (state.deleted.get() || state.dead.get()) {
    return (
      <div className="pl-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <div className="flex-shrink-0 py-2">
              <User size={16} />
            </div>
            <span className="font-medium">
              {state.deleted.get()
                ? "[deleted]"
                : state.dead.get()
                ? "[dead]"
                : state.by.get()}
            </span>
            <span>•</span>
            <span>{formattedDate(state.time.get())}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pl-4"
      style={{ backgroundColor: alpha(getColorForDepth(props.depth), 0.1) }}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            onClick={() => expandedSate.set((p) => !p)}
            className="flex items-center gap-2"
          >
            <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
              <div className="flex-shrink-0 py-2">
                <User size={16} />
              </div>
              <Link
                to={`/profile/${state.by.get()}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="font-medium">
                  {state.deleted.get()
                    ? "[deleted]"
                    : state.dead.get()
                    ? "[dead]"
                    : state.by.get()}
                  {/* {new Date().toISOString()} */}
                </span>
              </Link>
              <span>•</span>
              <span>{formattedDate(state.time.get())}</span>
            </div>

            <button className="flex-shrink-0 p-2 rounded">
              {expandedSate.get() ? <Minus size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {expandedSate.get() && (
            <>
              <div className="flex w-full flex-1 max-w-full overflow-hidden">
                <div
                  className="mt-1 pr-2 pb-2 text-sm prose dark:prose-invert max-w-full prose-a:no-underline prose-a:text-lime-200"
                  dangerouslySetInnerHTML={{
                    __html: decode(state.text.get() || ""),
                  }}
                />
              </div>

              <div className="flex items-center gap-4 pb-2 text-sm">
                <Link
                  to={`/${state.id.get()}/new`}
                  className="text-muted-foreground"
                >
                  <span className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                    <MessageSquare size={16} />
                    <span>reply</span>
                  </span>
                </Link>
              </div>

              <CommentThread nodes={state.children} depth={props.depth + 1} />
              <CommentLoadMoreButton node={state} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
