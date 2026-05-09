'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useSubscriptions } from '@/context/SubscriptionContext';

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#6366F1',
  Productivity: '#3B82F6',
  'Cloud Storage': '#0EA5E9',
  Health: '#10B981',
  'News & Media': '#F59E0B',
  'Developer Tools': '#8B5CF6',
  Education: '#58CC02',
  Finance: '#EC4899',
  Design: '#F24E1E',
  Other: '#6B7280',
};

interface TooltipPayloadItem {
  value: number;
  payload: { category: string; count: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-elevated px-4 py-3">
      <p className="text-sm font-700 text-foreground mb-1">{label}</p>
      <p className="text-base font-800 text-primary tabular-nums">
        ${payload[0].value.toFixed(2)}<span className="text-xs font-500 text-muted-foreground">/mo</span>
      </p>
      <p className="text-xs text-muted-foreground">{payload[0].payload.count} subscription{payload[0].payload.count > 1 ? 's' : ''}</p>
    </div>
  );
}

export default function CategorySpendChart() {
  const { subscriptions } = useSubscriptions();

  const categoryMap = subscriptions
    .filter((s) => s.status === 'active')
    .reduce<Record<string, { spend: number; count: number }>>((acc, s) => {
      const monthly = s.billingCycle === 'Annual' ? s.price / 12 : s.billingCycle === 'Quarterly' ? s.price / 3 : s.price;
      if (!acc[s.category]) acc[s.category] = { spend: 0, count: 0 };
      acc[s.category].spend += monthly;
      acc[s.category].count += 1;
      return acc;
    }, {});

  const categoryData = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      spend: Math.round(data.spend * 100) / 100,
      count: data.count,
      color: CATEGORY_COLORS[category] ?? '#6B7280',
    }))
    .sort((a, b) => b.spend - a.spend);

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-700 text-foreground">Spend by Category</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly cost breakdown across {categoryData.length} categories</p>
        </div>
        <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-500">
          Live
        </span>
      </div>
      {categoryData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No active subscriptions</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', radius: 4 }} />
            <Bar dataKey="spend" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {categoryData.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}