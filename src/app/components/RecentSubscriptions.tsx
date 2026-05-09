import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ServiceLogo from '@/components/ServiceLogo';

// Backend: replace with API call to GET /api/subscriptions?limit=5&sort=created_at:desc
const recentSubs = [
  { id: 'sub-001', name: 'GitHub Copilot', category: 'Developer Tools', price: 10.00, cycle: 'Monthly', nextBilling: 'May 18, 2026', status: 'active' as const, color: '#24292E' },
  { id: 'sub-002', name: 'Calm', category: 'Health', price: 14.99, cycle: 'Monthly', nextBilling: 'May 22, 2026', status: 'active' as const, color: '#5B8DEF' },
  { id: 'sub-003', name: 'Duolingo Plus', category: 'Education', price: 6.99, cycle: 'Monthly', nextBilling: 'May 28, 2026', status: 'trial' as const, color: '#58CC02' },
  { id: 'sub-004', name: 'Figma Pro', category: 'Productivity', price: 15.00, cycle: 'Monthly', nextBilling: 'Jun 1, 2026', status: 'active' as const, color: '#F24E1E' },
  { id: 'sub-005', name: 'Grammarly', category: 'Productivity', price: 12.00, cycle: 'Monthly', nextBilling: 'Jun 5, 2026', status: 'paused' as const, color: '#15C39A' },
];

export default function RecentSubscriptions() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-base font-700 text-foreground">Recent Subscriptions</h2>
        <Link
          href="/subscription-management"
          className="flex items-center gap-1.5 text-sm font-600 text-primary hover:text-blue-700 transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-6 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Cycle</th>
              <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Next Billing</th>
              <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-muted/40 transition-colors duration-100">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <ServiceLogo name={sub.name} color={sub.color} size={32} />
                    <p className="text-sm font-600 text-foreground">{sub.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-500">
                    {sub.category}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-700 text-foreground tabular-nums">${sub.price.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{sub.cycle}</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">{sub.nextBilling}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={sub.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}