export type AuthenticatedUserRole = 'CREATOR' | 'VIEWER' | 'PARENT' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  role: AuthenticatedUserRole;
  suspendedAt?: string | null;
}
