'use client';

import { AuthProvider } from '@/components/AuthProvider';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
