export enum ItemType {
  Story = "story",
  Job = "job",
  Poll = "poll",
  PollOpt = "pollopt",
  Comment = "comment",
}

export interface Item {
  // Required
  id: number;
  time: number;
  type: ItemType;

  // Optional
  deleted?: boolean;
  by?: string;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

export interface CommentNode extends Item {
  children: CommentNode[];
  isLoading: boolean;
  hasMore: boolean;
}
