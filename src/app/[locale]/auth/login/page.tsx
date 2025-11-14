import LoginForm from '@features/auth/components/login-form';
import { AuthLayout } from '@shared/layout/auth-layout';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
  // 从 feature 级翻译中提取登录页面数据
  const t = await getTranslations('auth.login');
  
  return (
    <AuthLayout 
      title={t('title')} 
      subtitle={t('subtitle')}
    >
      <LoginForm />
    </AuthLayout>
  );
}
