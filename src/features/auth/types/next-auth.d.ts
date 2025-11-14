/**
 * NextAuth types augmentation
 * extend NextAuth Session and JWT types to include custom fields
 * 
 */

import { UserRole } from '@shared/types/user';

declare module 'next-auth' {
  /**
   * Session type augmentation
   * adding full user info to session.user
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }

  /**
   * User type augmentation
   * typically used in callbacks and middleware
   */
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWT Token type augmentation
   * defines the user info stored in the JWT
   */
  interface JWT {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
  }
}
