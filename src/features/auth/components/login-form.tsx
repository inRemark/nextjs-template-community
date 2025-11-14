'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@features/auth/hooks/use-auth';
import { FormField } from './form-field';
import { SocialLogin } from './social-login';
import { Divider } from '@shared/ui/divider';
import { Button } from '@shared/ui/button';
import { Alert, AlertDescription } from '@shared/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { logger } from '@logger';
interface LoginFormProps {
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
  if (password.length < 6) return t('auth.validation.passwordTooShort').replace('{min}', '6');
  return undefined;
};

export default function LoginForm({ onSuccess }: LoginFormProps = {}) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      const validator = field === 'email' ? validateEmail : validatePassword;
      const error = validator(value, t);
      setErrors(prev => ({ ...prev, [field]: error || '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email, t);
    const passwordError = validatePassword(formData.password, t);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
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
      await authLogin(formData.email, formData.password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.errors.loginFailed');
      setServerError(errorMessage);
      logger.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // add a delay to ensure state updates are complete
      setTimeout(() => {
        router.push('/console');
      }, 100);
    }
  };

  const handleSocialError = (provider: string, error: string) => {
    setServerError(t('auth.errors.socialLoginFailed', { provider, error }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* server error message */}
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          name="email"
          label={t('auth.login.emailLabel')}
          type="email"
          value={formData.email}
          onChange={(value) => handleFieldChange('email', value)}
          error={errors.email}
          placeholder={t('auth.login.emailPlaceholder')}
          required
        />

        <FormField
          name="password"
          label={t('auth.login.passwordLabel')}
          type="password"
          value={formData.password}
          onChange={(value) => handleFieldChange('password', value)}
          error={errors.password}
          placeholder={t('auth.login.passwordPlaceholder')}
          showPasswordToggle
          required
        />

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('auth.login.submitting')}
            </>
          ) : (
            t('auth.login.submitButton')
          )}
        </Button>
      </form>

      <Divider text={t('auth.login.dividerOr')} />

      <SocialLogin
        providers={['google', 'github']}
        onSuccess={handleSocialSuccess}
        onError={handleSocialError}
        disabled={loading}
      />

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('auth.login.registerLink')}
          </Link>
        </p>
      </div>
    </>
  );
}