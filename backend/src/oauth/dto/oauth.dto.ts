export type OAuthProvider = 'google' | 'github' | 'linkedin';

export interface OAuthUserInfo {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  avatarUrl?: string;
}
