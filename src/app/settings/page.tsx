'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations, SUPPORTED_LANGUAGES, Language } from '@/lib/i18n';
import { userService, UserProfile } from '@/lib/services/userService';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Bell, Globe, LogOut, Check, Loader2, Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = getTranslations(language);
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const p = await userService.getProfile();
        if (p) {
          setProfile(p);
          setName(p.fullName);
          setNotificationsEnabled(p.notificationsEnabled);
          setRenewalAlerts(p.renewalAlerts);
          setWeeklyDigest(p.weeklyDigest);
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await userService.updateProfile({ fullName: name });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err: any) {
      console.error('Failed to save name:', err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    try {
      await userService.updateProfile({ language: lang });
    } catch (err: any) {
      console.error('Failed to save language:', err.message);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await userService.updateProfile({ notificationsEnabled, renewalAlerts, weeklyDigest });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err: any) {
      console.error('Failed to save preferences:', err.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/sign-up-login-screen');
    } catch (err: any) {
      console.error('Logout error:', err.message);
      setLoggingOut(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-700 text-foreground">{t.settingsTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.settingsDesc}</p>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Personal Information */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-700 text-foreground flex items-center gap-2">
                <User size={15} className="text-muted-foreground" /> {t.personalInfo}
              </h3>

              {/* Avatar placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/10 flex-shrink-0">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-base font-700 text-foreground">{name || user?.email?.split('@')[0]}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-600 px-2 py-0.5 rounded-full mt-1 inline-block">{t.freePlan}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-600 text-muted-foreground uppercase tracking-wider">{t.fullName}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-600 text-muted-foreground uppercase tracking-wider">{t.emailAddress}</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="input-field pl-9 opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {savingName ? (
                    <><Loader2 size={14} className="animate-spin" /> {t.save}...</>
                  ) : nameSaved ? (
                    <><Check size={14} /> {t.saved}</>
                  ) : (
                    t.saveChanges
                  )}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-700 text-foreground flex items-center gap-2">
                <Globe size={15} className="text-muted-foreground" /> {t.language}
              </h3>
              <p className="text-xs text-muted-foreground">{t.languageDesc}</p>
              <div className="flex gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-600 transition-all ${
                      language === lang.code
                        ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {lang.label}
                    {language === lang.code && <Check size={14} className="inline ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-700 text-foreground flex items-center gap-2">
                  <Bell size={15} className="text-muted-foreground" /> {t.notificationPrefs}
                </h3>
                <button
                  onClick={handleSavePrefs}
                  disabled={savingPrefs}
                  className="text-xs font-600 text-primary hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  {savingPrefs ? (
                    <><Loader2 size={12} className="animate-spin" /> {t.save}...</>
                  ) : prefsSaved ? (
                    <><Check size={12} /> {t.saved}</>
                  ) : (
                    t.saveChanges
                  )}
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'notificationsEnabled' as const, label: t.notificationsEnabled, desc: t.notificationsEnabledDesc, value: notificationsEnabled, onChange: setNotificationsEnabled },
                  { key: 'renewalAlerts' as const, label: t.renewalAlerts, desc: t.renewalAlertsDesc, value: renewalAlerts, onChange: setRenewalAlerts },
                  { key: 'weeklyDigest' as const, label: t.weeklyDigest, desc: t.weeklyDigestDesc, value: weeklyDigest, onChange: setWeeklyDigest },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div>
                      <p className="text-sm font-600 text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="card p-6">
              <h3 className="text-sm font-700 text-foreground flex items-center gap-2 mb-4">
                <Shield size={15} className="text-muted-foreground" /> Account
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="text-sm font-600 text-red-700">{t.logout}</p>
                  <p className="text-xs text-red-500 mt-0.5">{t.logoutDesc}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-600 rounded-lg transition-colors"
                >
                  {loggingOut ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  {t.logout}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
