export enum HNItemType {
  Story = "story",
  Job = "job",
  Poll = "poll",
  PollOpt = "pollopt",
  Comment = "comment",
}

export interface HNItem {
  // Required
  id: number;
  time: number;
  type: HNItemType;

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

export interface CommentNode extends HNItem {
  children: CommentNode[];
  isLoading: boolean;
  hasMore: boolean;
}
