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
    <div className="space-y-2">
      {state.ornull &&
        state.ornull.map((nodeState: State<CommentNode>, i) => (
          <div key={i} className="space-y-2">
            <Comment nameState={nodeState} depth={depth} />
          </div>
        ))}
    </div>
  );
};
