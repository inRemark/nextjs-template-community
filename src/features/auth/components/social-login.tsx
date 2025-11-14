'use client';
import { logger } from '@logger';

import { signIn } from 'next-auth/react';
import { Button } from '@shared/ui/button';
import { FaGithub, FaGoogle, FaWeixin } from "react-icons/fa";

type OAuthProvider = 'google' | 'github' | 'wechat';

interface SocialLoginProps {
  providers?: OAuthProvider[];
  onSuccess?: (provider: string, userData: any) => void;
  onError?: (provider: string, error: string) => void;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    label: "Login with Google",
    icon: FaGoogle,
    className: "border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
  },
  github: {
    label: "Login with GitHub",
    icon: FaGithub,
    className: "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950"
  },
  wechat: {
    label: "Login with WeChat",
    icon: FaWeixin,
    className: "border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
  }
};

export function SocialLogin({ 
  providers = ['google', 'github', 'wechat'],
  onSuccess,
  onError,
  disabled = false 
}: Readonly<SocialLoginProps>) {
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      await signIn(provider, { 
        callbackUrl: '/profile',
        redirect: true 
      });
      
      // Note: Actual user data is not available here due to redirect
      onSuccess?.(provider, { success: true });
    } catch (error) {
      logger.error(`${provider} login error:`, error);
      onError?.(provider, 'Login failed, please try again later');
    }
  };

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => {
        const config = providerConfig[provider];
        const Icon = config.icon;
        
        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className={`w-full ${config.className}`}
            onClick={() => handleOAuthLogin(provider)}
            disabled={disabled}
          >
            <Icon className="w-5 h-5 mr-2" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}