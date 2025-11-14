'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@shared/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 text-red-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
        <p className="text-gray-600 mb-6">
          您没有足够的权限访问此页面。如果您认为这是错误，请联系系统管理员。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/')} variant="default">
            返回首页
          </Button>
          <Button onClick={() => router.push('/auth/login')} variant="outline">
            重新登录
          </Button>
        </div>
      </div>
    </div>
  );
}