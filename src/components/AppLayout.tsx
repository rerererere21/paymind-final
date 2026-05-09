import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activePath={activePath} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}