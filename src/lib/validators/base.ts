import { z } from 'zod';

/**
 * baseSchemas provides common validation schemas for reuse across different modules
 * 
 * @module validators/base
 * @description Provides unified validation rules and helper functions to ensure consistent validation logic between frontend and backend
 */

/**
 * Validate regular expression constants
 * Centralize management of all regular expressions for easy maintenance and reuse
 */
const REGEX_PATTERNS = {
  /** email format: xxx@xxx.xxx */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** URL format: http(s)://... */
  url: /^https?:\/\/.+/,
  /** CUID2 format: 24-32 lowercase letters + numbers */
  cuid: /^[a-z0-9]{24,32}$/,
  /** lowercase letters */
  lowercase: /[a-z]/,
  /** uppercase letters */
  uppercase: /[A-Z]/,
  /** digits */
  digit: /\d/,
  /** special characters */
  specialChar: /[!@#$%^&*(),.?":{}|<>]/,
} as const;

// baseSchemas provides common validation schemas for reuse across different modules
export const baseSchemas = {
  // Validate text
  text: z.string()
    .trim()
    .min(1, 'Text cannot be empty')
    .max(1000, 'Text length cannot exceed 1000 characters'),

  // Validate long text
  longText: z.string()
    .trim()
    .min(1, 'Text cannot be empty')
    .max(10000, 'Text length cannot exceed 10000 characters'),

  // Validate optional text
  optionalText: z.string()
    .trim()
    .max(1000, 'Text length cannot exceed 1000 characters')
    .optional(),

  // Validate email
  email: z.string()
    .trim()
    .toLowerCase()
    .regex(REGEX_PATTERNS.email, 'Please enter a valid email address')
    .max(255, 'Email length cannot exceed 255 characters'),

  // Validate URL
  url: z.string()
    .trim()
    .regex(REGEX_PATTERNS.url, 'Please enter a valid URL')
    .max(500, 'URL length cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  // Validate search query
  searchQuery: z.string()
    .trim()
    .max(100, 'Search query length cannot exceed 100 characters')
    .optional(),

  // Validate password - consistent with PasswordStrength component rules
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password length cannot exceed 128 characters')
    .regex(REGEX_PATTERNS.lowercase, 'Password must contain at least one lowercase letter')
    .regex(REGEX_PATTERNS.uppercase, 'Password must contain at least one uppercase letter')
    .regex(REGEX_PATTERNS.digit, 'Password must contain at least one digit')
    .regex(REGEX_PATTERNS.specialChar, 'Password must contain at least one special character'),

  // Validate confirm password
  confirmPassword: z.string(),

  // Validate tags array
  tags: z.array(
    z.string()
      .trim()
      .min(1, 'Tag cannot be empty')
      .max(50, 'Tag length cannot exceed 50 characters')
  ).max(20, 'Tag array cannot exceed 20 items').optional(),

  // Validate pagination parameters
  pagination: z.object({
    page: z.coerce.number().int().min(1, 'Page must be greater than 0').default(1),
    limit: z.coerce.number().int().min(1, 'Items per page must be greater than 0').max(100, 'Items per page cannot exceed 100').default(20),
  }),

  // Validate sorting parameters
  sorting: z.object({
    sortBy: z.string().max(50, 'Sort field name length cannot exceed 50 characters').optional(),
    sortOrder: z.enum(['asc', 'desc'], { message: 'Sort order must be asc or desc' }).default('desc'),
  }),
};

// Validation helper functions
export const validationHelpers = {
  // Validate ID format (CUID2 format: 24-32 characters, consisting of a-z0-9)
  validateId: (id: string): boolean => {
    return REGEX_PATTERNS.cuid.test(id);
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    return REGEX_PATTERNS.email.test(email);
  },

  // Validate URL format
  validateUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Validate password strength
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;
    
    const checks = [
      { test: password.length >= 8, message: 'Password must be at least 8 characters long' },
      { test: REGEX_PATTERNS.lowercase.test(password), message: 'Password must contain at least one lowercase letter' },
      { test: REGEX_PATTERNS.uppercase.test(password), message: 'Password must contain at least one uppercase letter' },
      { test: REGEX_PATTERNS.digit.test(password), message: 'Password must contain at least one digit' },
      { test: REGEX_PATTERNS.specialChar.test(password), message: 'Password must contain at least one special character' },
    ];
    
    for (const check of checks) {
      if (check.test) {
        score += 1;
      } else {
        feedback.push(check.message);
      }
    }
    
    return {
      isValid: score >= 3,
      score,
      feedback,
    };
  },

  // Validate file size
  validateFileSize: (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
};

// Validation messages
export const validationMessages = {
  required: 'This field is required',
  invalid: 'Invalid input format',
  tooShort: (min: number) => `Length must be at least ${min} characters`,
  tooLong: (max: number) => `Length cannot exceed ${max} characters`,
  invalidEmail: 'Please enter a valid email address',
  invalidUrl: 'Please enter a valid URL',
  passwordMismatch: 'Password confirmation does not match password',
  invalidFileType: 'Unsupported file type',
  fileTooLarge: 'File size exceeds limit',
  invalidRating: 'Rating must be between 1 and 5',
  tooManyItems: (max: number) => `Cannot select more than ${max} items`,
  tooFewItems: (min: number) => `Cannot select fewer than ${min} items`,
};
