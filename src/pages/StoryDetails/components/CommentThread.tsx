import { CommentNode } from "@/types/hackernews";
import { State, useHookstate } from "@hookstate/core";
import { Comment } from "./Comment";

export const CommentThread = (props: {
  nodes: State<CommentNode[]>;
  depth?: number;
}) => {
  const { depth = 0 } = props;
  const state = useHookstate(props.nodes);

  return (
    <div
      // className="pl-0"
      style={{
        // paddingLeft: `${depth + 20}px`,
        // paddingRight: `${depth + 20}px`,
        // marginBottom: "0.5rem",
        // marginTop: "0.5rem",
        // borderLeft: "1px solid #ccc",
        display: "flex",
        flexDirection: "column",
        gap: depth === 0 ? "0.5rem" : "0",
        borderLeftWidth: depth < 1 ? "0" : "1px",
      }}
    >
      {state.ornull &&
        state.ornull.map((nodeState: State<CommentNode>, i) => (
          <div
            key={i}
            className="space-y-0"
            style={{
              backgroundColor: "#0e111b",
            }}
          >
            <Comment nameState={nodeState} depth={depth} />
          </div>
        ))}
    </div>
  );
};
