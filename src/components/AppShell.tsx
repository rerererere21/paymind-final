import React from 'react';
import TopNav from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
