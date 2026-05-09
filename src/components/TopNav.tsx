'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  Settings,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations } from '@/lib/i18n';
import NotificationBell from '@/components/NotificationBell';
import { useProfile } from '@/context/ProfileContext';

const navItems = [
  {
    id: 'nav-dashboard',
    labelKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'nav-subscriptions',
    labelKey: 'subscriptions',
    href: '/subscription-management',
    icon: CreditCard,
  },
  {
    id: 'nav-add',
    labelKey: 'addNew',
    href: '/add-subscription',
    icon: Plus,
  },
  {
    id: 'nav-settings',
    labelKey: 'settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const router = useRouter();
  const { profileImage, userName: profileUserName } = useProfile();

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/dashboard' && pathname.startsWith(href));

  const displayName =
    profileUserName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-up-login-screen');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 flex-shrink-0 min-w-0"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                <img
                  src="/assets/images/ChatGPT_Image_30_2026_04_37_35_-1777556439227.png"
                  alt="PayMind logo"
                  width={36}
                  height={36}
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                  }}
                />
              </div>
              <span
                className="font-extrabold text-lg tracking-tight hidden sm:block"
                style={{ color: '#1A3C6E' }}
              >
                PayMind
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const NavIcon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500 transition-all duration-150 whitespace-nowrap ${
                      active
                        ? 'bg-primary/10 text-primary font-600'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <NavIcon size={16} />
                    {(t as any)[item.labelKey]}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Avatar / Name */}
              <Link
                href="/profile"
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-primary/20 overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-700 text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <span className="hidden lg:block text-sm font-600 text-foreground group-hover:text-primary transition-colors">
                  {displayName.split(' ')[0]}
                </span>
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-negative transition-colors px-2 py-1.5 rounded-lg hover:bg-negative/5"
                title={t.signOut}
              >
                <LogOut size={15} />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                {mobileOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative bg-card border-b border-border shadow-lg animate-fadeIn">
            <nav className="max-w-screen-2xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const NavIcon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-500 transition-all duration-150 ${
                      active
                        ? 'bg-primary/10 text-primary font-600'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <NavIcon size={18} />
                    {(t as any)[item.labelKey]}
                  </Link>
                );
              })}

              <div className="border-t border-border pt-2 mt-2">
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-500 text-muted-foreground hover:bg-negative/5 hover:text-negative transition-colors"
                >
                  <LogOut size={18} />
                  {t.signOut}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
