export enum ItemType {
  Story = "story",
  Job = "job",
  Poll = "poll",
  PollOpt = "pollopt",
  Comment = "comment",
}

// {
//   "comments": [7, 9, 12, 13, 14, 15, 16, 17, 25, 35, 36],
//   "email": "ssarkar791@gmail.com",
//   "id": "lfQ5K3bcK6N3m40qLQ5kBGlnKe03",
//   "items": [8, 10, 11],
//   "profile_picture": "https://lh3.googleusercontent.com/a/ACg8ocJvRANVQdHNWelsqij8TEJIwAY0mV7zZwJiRqTCGq1oug1eYf_v=s96-c",
//   "username": "funny_boy"
// }
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string;
  karma: number;
  profile_picture: string;
  comments: number[];
  items: number[];
}

export interface Item {
  // Required
  id: number;
  time: number;
  type: ItemType;

  // Optional
  votes?: Record<string, boolean>;

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
