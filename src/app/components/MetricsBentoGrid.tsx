import React from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';

const metrics = [
  {
    id: 'metric-monthly-total',
    label: 'Total Monthly Spend',
    value: '$147.93',
    subtext: '+$12.99 from last month',
    trend: 'up',
    icon: DollarSign,
    hero: true,
    color: 'bg-primary text-white',
    iconBg: 'bg-white/20',
    subtextColor: 'text-blue-100',
  },
  {
    id: 'metric-active',
    label: 'Active Subscriptions',
    value: '12',
    subtext: '2 paused, 1 trial',
    trend: 'neutral',
    icon: CreditCard,
    hero: false,
    color: 'bg-card',
    iconBg: 'bg-primary/10',
    subtextColor: 'text-muted-foreground',
    iconColor: 'text-primary',
  },
  {
    id: 'metric-annual',
    label: 'Annual Projection',
    value: '$1,775.16',
    subtext: 'Based on current subs',
    trend: 'neutral',
    icon: TrendingUp,
    hero: false,
    color: 'bg-card',
    iconBg: 'bg-emerald-50',
    subtextColor: 'text-muted-foreground',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'metric-upcoming',
    label: 'Renewing in 7 Days',
    value: '3',
    subtext: 'Next: Spotify on May 2',
    trend: 'warning',
    icon: AlertTriangle,
    hero: false,
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    subtextColor: 'text-amber-700',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    valueColor: 'text-amber-800',
  },
  {
    id: 'metric-categories',
    label: 'Spending Categories',
    value: '6',
    subtext: 'Entertainment leads at $42.97',
    trend: 'neutral',
    icon: Layers,
    hero: false,
    color: 'bg-card',
    iconBg: 'bg-purple-50',
    subtextColor: 'text-muted-foreground',
    iconColor: 'text-purple-600',
  },
];

export default function MetricsBentoGrid() {
  const hero = metrics?.find((m) => m?.hero);
  const regular = metrics?.filter((m) => !m?.hero);

  return (
    // grid-cols-4: hero spans 2 cols (row 1: hero + 2 regular), row 2: 3 regular
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
      {/* Hero card — spans 2 cols */}
      {hero && (
        <div
          key={hero?.id}
          className={`${hero?.color} rounded-xl p-6 sm:col-span-2 lg:col-span-2 border border-primary shadow-blue`}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-600 text-blue-100 uppercase tracking-wider">{hero?.label}</p>
            <div className={`w-10 h-10 rounded-xl ${hero?.iconBg} flex items-center justify-center`}>
              <hero.icon size={20} className="text-white" />
            </div>
          </div>
          <p className="text-4xl font-800 text-white tabular-nums mb-2">{hero?.value}</p>
          <p className={`text-sm ${hero?.subtextColor}`}>{hero?.subtext}</p>
        </div>
      )}
      {/* Regular cards */}
      {regular?.map((metric) => (
        <div
          key={metric?.id}
          className={`card ${metric?.color} rounded-xl p-5 border`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className={`text-xs font-600 uppercase tracking-wider ${metric?.textColor || 'text-muted-foreground'}`}>
              {metric?.label}
            </p>
            <div className={`w-8 h-8 rounded-lg ${metric?.iconBg} flex items-center justify-center`}>
              <metric.icon size={16} className={metric?.iconColor || 'text-foreground'} />
            </div>
          </div>
          <p className={`text-2xl font-800 tabular-nums mb-1 ${metric?.valueColor || 'text-foreground'}`}>
            {metric?.value}
          </p>
          <p className={`text-xs ${metric?.subtextColor}`}>{metric?.subtext}</p>
        </div>
      ))}
    </div>
  );
}