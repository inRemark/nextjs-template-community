/**
 * auth services index
 */

// NextAuth config and main auth functions
export { authConfig, auth, signIn, signOut } from './auth.config';

// Unified authentication middleware (recommended)
export {
  requireAuth,
  requireAdmin,
  requireRole,
  withNextAuth,
  getCurrentSession,
  getAuthUserFromRequest,
} from '../middleware/auth.middleware';

// Password utility functions
export {
  hashPassword,
  verifyPassword
} from './auth.service';

// RBAC services
export {
  hasPermission,
  hasRole
} from './rbac.service';

// Auth types and errors
export { AuthError } from '../types/auth.error';
export type { MeResponse } from '../types/auth.types';