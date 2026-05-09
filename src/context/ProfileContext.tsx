'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProfileContextValue {
  profileImage: string | null;
  userName: string;
  setProfileImage: (dataUrl: string | null) => void;
  setUserName: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY_IMG = 'paymind_profile_image';
const STORAGE_KEY_NAME = 'paymind_user_name';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState('');

  useEffect(() => {
    try {
      const img = localStorage.getItem(STORAGE_KEY_IMG);
      if (img) setProfileImageState(img);
      const name = localStorage.getItem(STORAGE_KEY_NAME);
      if (name) setUserNameState(name);
    } catch {
      // ignore
    }
  }, []);

  const setProfileImage = (dataUrl: string | null) => {
    setProfileImageState(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(STORAGE_KEY_IMG, dataUrl);
      else localStorage.removeItem(STORAGE_KEY_IMG);
    } catch {
      // ignore
    }
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    try {
      localStorage.setItem(STORAGE_KEY_NAME, name);
    } catch {
      // ignore
    }
  };

  return (
    <ProfileContext.Provider value={{ profileImage, userName, setProfileImage, setUserName }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
