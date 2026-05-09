'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { useProfile } from '@/context/ProfileContext';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Camera, Check, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const { setProfileImage: setGlobalProfileImage, setUserName: setGlobalUserName } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoadingProfile(true);
      try {
        const p = await userService.getProfile();
        if (p) {
          setName(p.fullName || '');
          setAvatarUrl(p.avatarUrl || null);
          if (p.avatarUrl) setGlobalProfileImage(p.avatarUrl);
          if (p.fullName) setGlobalUserName(p.fullName);
        } else if (user) {
          const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
          setName(fallbackName);
          if (fallbackName) setGlobalUserName(fallbackName);
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
      setGlobalProfileImage(publicUrl);

      await userService.updateProfile({ avatarUrl: publicUrl } as any);
    } catch (err: any) {
      // Fallback: use base64 data URL
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setAvatarUrl(dataUrl);
        setGlobalProfileImage(dataUrl);
        try {
          await userService.updateProfile({ avatarUrl: dataUrl } as any);
        } catch {
          // silently ignore
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await userService.updateProfile({ fullName: name });
      setGlobalUserName(name);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = name || user?.email?.split('@')[0] || 'User';

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/settings" className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-700 text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Update your profile photo and personal details</p>
          </div>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Profile Photo */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-700 text-foreground flex items-center gap-2">
                <Camera size={15} className="text-muted-foreground" /> Profile Photo
              </h3>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/10 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-700 text-primary">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-base font-700 text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Camera size={13} />
                    {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF · Max 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-700 text-foreground flex items-center gap-2">
                <User size={15} className="text-muted-foreground" /> Personal Information
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-500">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-600 text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-600 text-muted-foreground uppercase tracking-wider">Email Address</label>
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
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><Check size={14} /> Saved!</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
