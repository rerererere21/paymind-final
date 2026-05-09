'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

type LoginInputs = {
  email: string;
  password: string;
  remember: boolean;
};

type SignupInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setSending(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?type=recovery`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-700 text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            We sent a password reset link to <span className="font-600 text-foreground">{email}</span>
          </p>
        </div>
        <button type="button" onClick={onBack} className="text-sm text-primary hover:text-blue-700 font-600 transition-colors">
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h3 className="text-lg font-700 text-foreground">Reset your password</h3>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-500">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="reset-email" className="block text-sm font-600 text-foreground">Email address</label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <button type="submit" disabled={sending} className="btn-primary w-full py-3">
        {sending ? (
          <><Loader2 size={16} className="animate-spin" /> Sending...</>
        ) : (
          <>Send Reset Link <ArrowRight size={16} /></>
        )}
      </button>

      <button type="button" onClick={onBack} className="w-full text-sm text-muted-foreground hover:text-foreground font-500 transition-colors">
        ← Back to sign in
      </button>
    </form>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  const onSubmit = async (data: LoginInputs) => {
    setAuthError('');
    try {
      await signIn(data.email, data.password);
      router.replace('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || t.invalidCredentials);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-500">
          {authError}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-600 text-foreground">{t.email}</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="input-field"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && <p className="text-xs text-red-600 font-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="block text-sm font-600 text-foreground">{t.password}</label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs text-primary hover:text-blue-700 font-500 transition-colors"
          >
            {t.forgotPassword}
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-field pr-10"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 font-500">{errors.password.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input id="remember" type="checkbox" className="w-4 h-4 rounded border-border accent-primary" {...register('remember')} />
        <label htmlFor="remember" className="text-sm text-muted-foreground">{t.rememberMe}</label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> {t.signingIn}</>
        ) : (
          <><span>{t.signInToPayMind}</span> <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');
  const password = watch('password');

  const onSubmit = async (data: SignupInputs) => {
    setAuthError('');
    try {
      await signUp(data.email, data.password, { fullName: data.name });
      router.replace('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-500">
          {authError}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="signup-name" className="block text-sm font-600 text-foreground">{t.name}</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          className="input-field"
          {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
        />
        {errors.name && <p className="text-xs text-red-600 font-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-sm font-600 text-foreground">{t.email}</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="input-field"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && <p className="text-xs text-red-600 font-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-password" className="block text-sm font-600 text-foreground">{t.password}</label>
        <p className="text-xs text-muted-foreground">At least 8 characters with a number or symbol</p>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="input-field pr-10"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: { value: /(?=.*[0-9!@#$%^&*])/, message: 'Must include a number or symbol' },
            })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 font-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-confirm" className="block text-sm font-600 text-foreground">{t.confirmPassword}</label>
        <div className="relative">
          <input
            id="signup-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="input-field pr-10"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-600 font-500">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex items-start gap-2">
        <input id="terms" type="checkbox" className="w-4 h-4 mt-0.5 rounded border-border accent-primary flex-shrink-0" {...register('terms', { required: 'You must accept the terms' })} />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
          I agree to PayMind&apos;s{' '}
          <span className="text-primary font-600 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-primary font-600 cursor-pointer hover:underline">Privacy Policy</span>
        </label>
      </div>
      {errors.terms && <p className="text-xs text-red-600 font-500">{errors.terms.message}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> {t.creatingAccount}</>
        ) : (
          <><span>{t.createFreeAccount}</span> <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { language } = useLanguage();
  const t = getTranslations(language);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-800 text-foreground">
          {activeTab === 'login' ? t.welcomeBack : t.getStarted}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {activeTab === 'login' ? t.signInDesc : t.signUpDesc}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {(['login', 'signup'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-600 transition-all ${
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'login' ? t.signIn : t.signUp}
          </button>
        ))}
      </div>

      {activeTab === 'login' ? <LoginForm /> : <SignupForm />}

      <p className="text-center text-sm text-muted-foreground">
        {activeTab === 'login' ? (
          <>{t.dontHaveAccount}{' '}
            <button onClick={() => setActiveTab('signup')} className="text-primary font-600 hover:underline">{t.signUpFree}</button>
          </>
        ) : (
          <>{t.alreadyHaveAccount}{' '}
            <button onClick={() => setActiveTab('login')} className="text-primary font-600 hover:underline">{t.signIn}</button>
          </>
        )}
      </p>
    </div>
  );
}