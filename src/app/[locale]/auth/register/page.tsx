import { Suspense } from 'react';
import RegisterForm from '@features/auth/components/register-form';
import { AuthLayout } from '@shared/layout/auth-layout';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';

async function RegisterFormWrapper() {
  // 从 feature 级翻译中提取注册页面数据
  const t = await getTranslations('auth.register');
  
  return (
    <AuthLayout 
      title={t('title')} 
      subtitle={t('subtitle')}
    >
      <RegisterForm />
    </AuthLayout>
  );
}

function LoadingFallback() {
  const t = useTranslations('common');
  return <div>{t('loading')}</div>;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterFormWrapper />
    </Suspense>
  );
}
