"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, PersonalSettings, UserActivity } from '@shared/types/user';

// Hook to manage user profile data
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const { avatarUrl } = await response.json();
      
      if (profile) {
        setProfile({ ...profile, avatar: avatarUrl });
      }
      
      return avatarUrl;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload avatar');
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}

export function usePersonalSettings() {
  const [settings, setSettings] = useState<PersonalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<PersonalSettings>) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}

export function useUserActivity(limit: number = 10) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/activity?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}