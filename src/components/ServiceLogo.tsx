'use client';

import React from 'react';

// Map of service names to their logo URLs
const SERVICE_LOGOS: Record<string, string> = {
  'spotify': '/assets/images/spotify-1777557059332.png',
  'netflix': 'https://logo.clearbit.com/netflix.com',
  'youtube': 'https://logo.clearbit.com/youtube.com',
  'youtube premium': 'https://logo.clearbit.com/youtube.com',
  'disney+': '/assets/images/disney-plus-1777558266940.jpg',
  'disney plus': '/assets/images/disney-plus-1777558266940.jpg',
  'disney': '/assets/images/disney-plus-1777558266940.jpg',
  'apple tv': 'https://logo.clearbit.com/apple.com',
  'apple tv+': 'https://logo.clearbit.com/apple.com',
  'hulu': 'https://logo.clearbit.com/hulu.com',
  'amazon prime': 'https://logo.clearbit.com/primevideo.com',
  'amazon prime video': 'https://logo.clearbit.com/primevideo.com',
  'adobe': '/assets/images/dA_QKgdh_400x400-1777557646767.jpg',
  'adobe creative': '/assets/images/dA_QKgdh_400x400-1777557646767.jpg',
  'adobe creative cloud': '/assets/images/dA_QKgdh_400x400-1777557646767.jpg',
  'notion': 'https://logo.clearbit.com/notion.so',
  'notion pro': 'https://logo.clearbit.com/notion.so',
  'github': 'https://logo.clearbit.com/github.com',
  'github copilot': 'https://logo.clearbit.com/github.com',
  'icloud': 'https://logo.clearbit.com/icloud.com',
  'icloud 200gb': 'https://logo.clearbit.com/icloud.com',
  'figma': 'https://logo.clearbit.com/figma.com',
  'figma pro': 'https://logo.clearbit.com/figma.com',
  'dropbox': 'https://logo.clearbit.com/dropbox.com',
  'dropbox plus': 'https://logo.clearbit.com/dropbox.com',
  'grammarly': 'https://logo.clearbit.com/grammarly.com',
  'grammarly premium': 'https://logo.clearbit.com/grammarly.com',
  'duolingo': 'https://logo.clearbit.com/duolingo.com',
  'duolingo plus': 'https://logo.clearbit.com/duolingo.com',
  'calm': 'https://logo.clearbit.com/calm.com',
  'the new york times': 'https://logo.clearbit.com/nytimes.com',
};

interface ServiceLogoProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export default function ServiceLogo({ name, color, size = 32, className = '' }: ServiceLogoProps) {
  const key = name.toLowerCase();
  const logoUrl = SERVICE_LOGOS[key];

  if (logoUrl) {
    return (
      <div
        className={`rounded-lg overflow-hidden flex-shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.style.backgroundColor = color;
              parent.style.display = 'flex';
              parent.style.alignItems = 'center';
              parent.style.justifyContent = 'center';
              parent.innerHTML = `<span style="color:white;font-size:${Math.floor(size * 0.4)}px;font-weight:800">${name.charAt(0)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  // Fallback: colored initial
  return (
    <div
      className={`rounded-lg flex items-center justify-center text-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, backgroundColor: color, fontSize: Math.floor(size * 0.4), fontWeight: 800 }}
    >
      {name.charAt(0)}
    </div>
  );
}
