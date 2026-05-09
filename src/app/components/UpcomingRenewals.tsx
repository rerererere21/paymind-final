'use client';

import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { useBills } from '@/contexts/BillsContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function UpcomingRenewals() {
  const { upcomingBills } = useBills();
  const { format } = useCurrency();

  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-700 text-foreground">Upcoming Renewals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Next 14 days</p>
        </div>
        <Calendar size={16} className="text-muted-foreground" />
      </div>
      {upcomingBills.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No upcoming renewals</div>
      ) : (
        <div className="space-y-3">
          {upcomingBills.slice(0, 5).map((bill) => {
            const days = getDaysUntil(bill.dueDate);
            const urgent = days <= 3;
            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 hover:bg-muted/60 ${urgent ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    {bill.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-600 text-foreground flex items-center gap-1.5">
                      {bill.title}
                      {urgent && <AlertCircle size={12} className="text-amber-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(bill.dueDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-700 text-foreground tabular-nums">{format(bill.amount)}</p>
                  <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${days <= 3 ? 'bg-red-50 text-red-600' : days <= 7 ? 'bg-amber-50 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                    {days}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}