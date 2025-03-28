import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formattedDate } from "@/lib/utils";
import { fetchProfileByUsername } from "@/services/hackernews-api";
import { CommentNode } from "@/types/hackernews";
import { State, useHookstate } from "@hookstate/core";
import { decode } from "html-entities";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CornerUpLeft,
  User,
} from "lucide-react";
import { Link } from "react-router";
import { CommentLoadMoreButton } from "./CommentLoadMoreButton";
import { CommentThread } from "./CommentThread";

export function UserHoverCardContent(props: { username: string }) {
  const { username } = props;
  const fetchResource = () => fetchProfileByUsername(username);
  const state = useHookstate(fetchResource);

  if (state.promised) {
    return <div>Loading...</div>;
  }
  if (state.error) {
    return <div>Error: {state.error.message}</div>;
  }
  const user = state.value;
  console.log("user", user);

  return (
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarImage src={user?.profile_picture} alt="Avatar" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <div className="space-y-1 flex-1">
        <h4 className="text-sm font-semibold">@{user?.username}</h4>
        <p className="text-sm">{user?.bio}</p>
        <div className="flex items-center pt-2">
          <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
          <span className="text-xs text-muted-foreground">
            Joined {user && user.created ? formattedDate(user.created) : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

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
      // style={{ backgroundColor: alpha(getColorForDepth(props.depth), 0.1) }}
    >
      {/* arc */}
      {/* <div className="absolute top-0 left-0 w-4 h-4 border border-lime-200 border-t-0 border-r-0 rounded-l-lg rounded-tl-none rounded-br-none" /> */}
      <div className="flex items-center gap-0">
        <div className="flex flex-col flex-1 overflow-hidden ">
          <div
            onClick={() => expandedSate.set((p) => !p)}
            className="flex items-center gap-2 "
          >
            <div className="flex flex-1 items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-shrink-0 py-2">
                <User size={14} />
              </div>

              <HoverCard>
                <HoverCardTrigger>
                  <Link
                    to={`/profile/${state.by.get()}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span className="font-medium">
                      {state.by.get()}
                      {/* {new Date().toISOString()} */}
                    </span>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-80 rounded-none bg-background border-0"
                  align="center"
                  side="bottom"
                >
                  <UserHoverCardContent username={state.by.get() ?? ""} />
                </HoverCardContent>
              </HoverCard>

              <span>•</span>
              <span>{formattedDate(state.time.get())}</span>
            </div>

            {/* <button className="flex-shrink-0 p-2 rounded">
              {expandedSate.get() ? <Minus size={16} /> : <Plus size={16} />}
            </button> */}
          </div>

          {expandedSate.get() && (
            <div

            // style={{
            //   borderLeftWidth: `${state.children.length > 1 ? 1 : 0}px`,
            // }}
            >
              <div className="pl-0">
                <div className="flex w-full flex-1 max-w-full overflow-hidden">
                  <div
                    className="mt-1 pr-2 pb-2 text-sm prose dark:prose-invert max-w-full prose-a:no-underline prose-a:text-lime-200"
                    dangerouslySetInnerHTML={{
                      __html: decode(state.text.get() || ""),
                    }}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 px-2 mb-2 text-sm">
                  <Link
                    to={`/${state.id.get()}/new`}
                    className="text-muted-foreground"
                  >
                    <button className="flex-shrink-0 rounded flex items-center gap-1">
                      <CornerUpLeft size={16} />
                    </button>
                  </Link>
                  <button className="flex-shrink-0 rounded flex items-center gap-1">
                    <ArrowUp size={16} />
                    <span>1.2k</span>
                  </button>
                  <button className="flex-shrink-0 rounded">
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
              <CommentThread nodes={state.children} depth={props.depth + 1} />
              <CommentLoadMoreButton node={state} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
