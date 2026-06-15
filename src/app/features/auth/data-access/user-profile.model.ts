export interface UserProfileStats {
  todosCompleted: number;
  loginCount: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  memberSince: string;
  stats: UserProfileStats;
}
