import { User, UserRole } from '@prisma/client';

// Auth response (now only returns user info, no token)
export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}

// Current user info response
export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Update user info request
export interface UpdateMeRequest {
  name: string;
}

/**
 * Unified Authenticated User Type
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}
