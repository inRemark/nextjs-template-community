'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { authAPI } from '@/lib/api-client';
import { FormField } from './form-field';
import { SocialLogin } from './social-login';
import { Divider } from '@shared/ui/divider';
import { PasswordStrength } from './password-strength';
import { Button } from '@shared/ui/button';
import { Alert, AlertDescription } from '@shared/ui/alert';
import { Badge } from '@shared/ui/badge';
import { Loader2, AlertCircle, Users, Gift } from 'lucide-react';
import { logger } from '@logger';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const validateEmail = (email: string, t: (key: string) => string): string | undefined => {
  if (!email) return t('auth.validation.emailRequired');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return t('auth.validation.emailInvalid');
  return undefined;
};

const validatePassword = (password: string, t: (key: string) => string): string | undefined => {
  if (!password) return t('auth.validation.passwordRequired');
  if (password.length < 8) return t('auth.validation.passwordTooShort').replace('{min}', '8');
  if (!/[a-zA-Z]/.test(password)) return t('auth.validation.passwordNeedLetter');
  if (!/\d/.test(password)) return t('auth.validation.passwordNeedNumber');
  return undefined;
};

const validateConfirmPassword = (password: string, confirmPassword: string, t: (key: string) => string): string | undefined => {
  if (!confirmPassword) return t('auth.validation.confirmPasswordRequired');
  if (password !== confirmPassword) return t('auth.validation.passwordMismatch');
  return undefined;
};

export default function RegisterForm({ onSuccess }: RegisterFormProps = {}) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralInfo, setReferralInfo] = useState<{ name?: string; email?: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // get referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  // check and validate referral code
  const validateReferralCode = async (code: string) => {
    try {
      const response = await fetch(`/api/referral/validate?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.isValid) {
          setReferralInfo(data.referrerInfo);
        }
      }
    } catch (error) {
      logger.error('Failed to validate referral code:', error);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // check field error on change
    if (errors[field]) {
      let error: string | undefined;
      
      switch (field) {
        case 'email':
          error = validateEmail(value, t);
          break;
        case 'password':
          error = validatePassword(value, t);
          // If password changes, also re-validate confirm password
          if (formData.confirmPassword) {
            const confirmError = validateConfirmPassword(value, formData.confirmPassword, t);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError || '' }));
          }
          break;
        case 'confirmPassword':
          error = validateConfirmPassword(formData.password, value, t);
          break;
      }
      
      setErrors(prev => ({ ...prev, [field]: error || '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email, t);
    const passwordError = validatePassword(formData.password, t);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword, t);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData.email, formData.password, '', referralCode || undefined);
      
      if (response.success) {
        // Auto login after successful registration
        const { signIn } = await import('next-auth/react');
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Call success callback or redirect
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/profile');
            router.refresh();
          }
        } else {
          // Show error but do not block registration
          setServerError(t('auth.errors.autoLoginFailed'));
          logger.error('Auto login failed after registration');
        }
      } else {
        setServerError(response.error || t('auth.errors.registerFailed'));
      }
    } catch (err) {
      setServerError(t('auth.errors.networkError'));
      logger.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = (provider: string, userData: unknown) => {
    logger.debug(`${provider} Registration Success`, userData);
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSocialError = (provider: string, error: string) => {
    setServerError(t('auth.errors.socialRegisterFailed', { provider, error }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Referral Information */}
        {referralInfo && (
          <Alert className="border-green-200 bg-green-50">
            <Users className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{referralInfo.name || t('auth.register.friend')}</strong> {t('auth.register.referralInvite')}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Gift className="h-3 w-3 mr-1" />
                  {t('auth.register.referralBonus')}
                </Badge>
              </div>
              <p className="text-sm mt-1">{t('auth.register.referralBenefit')}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Server error message */}
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Email field */}
        <FormField
          name="email"
          label={t('auth.register.emailLabel')}
          type="email"
          value={formData.email}
          onChange={(value) => handleFieldChange('email', value)}
          error={errors.email}
          placeholder={t('auth.register.emailPlaceholder')}
          required
        />

        {/* Password field */}
        <FormField
          name="password"
          label={t('auth.register.passwordLabel')}
          type="password"
          value={formData.password}
          onChange={(value) => handleFieldChange('password', value)}
          error={errors.password}
          placeholder={t('auth.register.passwordPlaceholder')}
          showPasswordToggle
          required
        />

        {/* Password strength indicator */}
        {formData.password && (
          <PasswordStrength password={formData.password} />
        )}

        {/* Confirm Password field */}
        <FormField
          name="confirmPassword"
          label={t('auth.register.confirmPasswordLabel')}
          type="password"
          value={formData.confirmPassword}
          onChange={(value) => handleFieldChange('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          showPasswordToggle
          required
        />

        {/* Register button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('auth.register.submitting')}
            </>
          ) : (
            t('auth.register.submitButton')
          )}
        </Button>
      </form>

      {/* Divider */}
      <Divider text={t('auth.register.dividerOr')} />

      {/* Social login */}
      <SocialLogin
        providers={['google', 'github']}
        onSuccess={handleSocialSuccess}
        onError={handleSocialError}
        disabled={loading}
      />

      {/* Login link */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          {t('auth.register.hasAccount')}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('auth.register.loginLink')}
          </Link>
        </p>
      </div>
    </>
  );
}