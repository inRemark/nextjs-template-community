export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  company?: string;
  department?: string;
  title?: string;
  bio?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  profileCompletion: number;
}

export interface ProfileSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

export interface PersonalSettings {
  privacy: {
    profileVisibility: 'public' | 'private' | 'team';
    showEmail: boolean;
    showPhone: boolean;
    showLastSeen: boolean;
  };
  notifications: {
    email: NotificationPreferences;
    browser: NotificationPreferences;
    mobile: NotificationPreferences;
  };
  workflow: {
    defaultEmailTemplate: string;
    autoSaveInterval: number;
    defaultSendDelay: number;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  emailSent: boolean;
  emailDelivered: boolean;
  emailOpened: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
  weeklyReport: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'USER';
export type UserStatus = 'active' | 'inactive' | 'suspended';