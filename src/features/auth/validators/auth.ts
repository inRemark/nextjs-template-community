import { z } from 'zod';
import { baseSchemas } from '@/lib/validators/base';

/**
 * Auth-related validation schemas
 */

// User registration validation schema (used on frontend, includes confirmPassword)
export const registerSchema = z.object({
  email: baseSchemas.email,
  password: baseSchemas.password,
  confirmPassword: baseSchemas.confirmPassword,
  name: z.string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Name required').max(100, 'Name must be at most 100 characters'))
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User registration validation schema (used on backend, no confirmPassword)
export const registerApiSchema = z.object({
  email: baseSchemas.email,
  password: baseSchemas.password,
  name: z.string()
    .transform((val) => val.trim())
    .optional()
    .refine((val) => !val || val.length <= 100, 'Name must be at most 100 characters'),
});

// User login validation schema
export const loginSchema = z.object({
  email: baseSchemas.email,
  password: z.string().min(1, 'Password required'),
});

// User profile update validation schema
export const profileSchema = z.object({
  name: z.string()
    .transform((val) => val.trim())
    .pipe(z.string().min(1, 'Name required').max(100, 'Name must be at most 100 characters'))
    .optional(),
  bio: z.string()
    .transform((val) => val.trim())
    .pipe(z.string().max(500, 'Bio must be at most 500 characters'))
    .optional(),
});

// User settings validation schema
export const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  reviewReminders: z.boolean().default(true),
  comparisonUpdates: z.boolean().default(true),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type RegisterApiData = z.infer<typeof registerApiSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type SettingsData = z.infer<typeof settingsSchema>;