import React from 'react';
import AuthForm from './components/AuthForm';

export default function SignUpLoginPage() {
return ( 
<div className="min-h-screen flex">

  <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
    
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full" />
    </div>

    <div className="relative flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
        <img
          src="/assets/images/ChatGPT_Image_30_2026_04_37_35_-1777556439227.png"
          alt="PayMind"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      <span className="text-white text-xl font-800 tracking-tight">PayMind</span>
    </div>

    <div className="relative space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-800 text-white leading-tight text-balance">
          Know exactly what you&apos;re paying for every month
        </h1>
        <p className="text-blue-100 text-base leading-relaxed max-w-sm">
          Track all your subscriptions in one place. See your real monthly cost, catch upcoming renewals, and stop paying for things you forgot about.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          'Renewal alerts',
          'Spend by category',
          'Annual projection',
          'Free to use',
        ].map((f) => (
          <span key={f} className="bg-white/15 text-white text-xs font-600 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {f}
          </span>
        ))}
      </div>

    </div>

    <p className="relative text-blue-200 text-xs">
      © 2026 PayMind. Free for personal use.
    </p>
  </div>

  <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
    <div className="w-full max-w-md">
      
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary flex items-center justify-center">
          <img
            src="/assets/images/ChatGPT_Image_30_2026_04_37_35_-1777556439227.png"
            alt="PayMind"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <span className="text-foreground text-xl font-800 tracking-tight">PayMind</span>
      </div>

      <AuthForm />
    </div>
  </div>

</div>
);
}