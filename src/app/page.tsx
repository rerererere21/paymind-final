'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingDown, Bell, BarChart2, Shield, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          
          {/* LOGO UPDATED */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
              <img
                src="/assets/images/ChatGPT_Image_30_2026_04_37_35_-1777556439227.png"
                alt="PayMind"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight">PayMind</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-up-login-screen" className="text-sm font-600 text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-xs font-600 px-3 py-1.5 rounded-full border border-accent mb-6">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          Free to use · No credit card required
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-800 text-foreground leading-tight text-balance mb-6">
          Stop paying for things<br />
          <span className="text-primary">you forgot about</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          PayMind tracks all your subscriptions in one place. See your real monthly cost, catch upcoming renewals, and take back control of your spending.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-primary text-base py-3 px-8 w-full sm:w-auto">
            Open Dashboard <ArrowRight size={18} />
          </Link>
          <Link href="/sign-up-login-screen" className="btn-secondary text-base py-3 px-8 w-full sm:w-auto">
            Sign in
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-800 text-white mb-4">Start tracking your subscriptions today</h2>
          <p className="text-blue-100 mb-8">Free forever. No credit card. No bank connections.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="bg-white text-primary font-700 text-base py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
              Open Dashboard <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <CheckCircle size={16} />
              <span>Free to use · No signup required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* LOGO UPDATED */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <img
                src="/assets/images/ChatGPT_Image_30_2026_04_37_35_-1777556439227.png"
                alt="PayMind"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span className="text-sm font-700 text-foreground">PayMind</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 PayMind. Free for personal use.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/subscription-management" className="text-xs text-muted-foreground hover:text-foreground">Subscriptions</Link>
            <Link href="/sign-up-login-screen" className="text-xs text-muted-foreground hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}