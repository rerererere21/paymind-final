import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { BillsProvider } from '@/contexts/BillsContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PayMind — Bill & Expense Tracker',
  description: 'PayMind helps you track all your bills and recurring expenses, get notified before due dates, and never miss a payment.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <LanguageProvider>
            <BillsProvider>
              <NotificationsProvider>
                <SubscriptionProvider>
                  <CurrencyProvider>
                    <ProfileProvider>
                      {children}
                    </ProfileProvider>
                  </CurrencyProvider>
                </SubscriptionProvider>
              </NotificationsProvider>
            </BillsProvider>
          </LanguageProvider>
        </AuthProvider>
</body>
    </html>
  );
}