export interface FeedAuthor {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  verified?: boolean;
}

export interface FeedJobRow {
  title: string;
  company: string;
  location?: string;
  matchScore?: number;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: string;
  image?: string;
  job?: FeedJobRow | null;
  likes: number;
  comments: number;
  shares: number;
  likedByMe?: boolean;
}

export interface FeedService {
  getFeed(): Promise<FeedPost[]>;
  createPost(input: { content: string; image?: string; author: FeedAuthor }): Promise<FeedPost>;
  toggleLike(postId: string): Promise<FeedPost>;
  addComment(postId: string): Promise<FeedPost>;
}

export interface HomeRailCard {
  label: string;
  value: number;
  hint: string;
}

export interface HomeRailData {
  primary: HomeRailCard;
  secondary: HomeRailCard;
  quickStats: { label: string; value: number }[];
  activity: { id: string; text: string; timeAgo: string }[];
  cta: { title: string; button: string; to: string };
}