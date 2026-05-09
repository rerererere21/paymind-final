'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import { useBills } from '@/contexts/BillsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations } from '@/lib/i18n';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar,
  AlertCircle,
  Loader2,
  Clock,
  PauseCircle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#3B82F6',
  Utilities: '#F59E0B',
  Insurance: '#8B5CF6',
  Subscriptions: '#EC4899',
  Healthcare: '#10B981',
  Transportation: '#6366F1',
  Education: '#58CC02',
  Entertainment: '#E11D48',
  Food: '#F97316',
  Finance: '#14B8A6',
  Other: '#6B7280',
};

export default function DashboardPage() {
  const { bills, loading, overdueBills, upcomingBills, paidBills, totalMonthly } = useBills();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getTranslations(language);
  const { format } = useCurrency();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

  const categoryTotals = bills
    .filter((b) => b.billStatus !== 'cancelled' && b.billStatus !== 'paid')
    .reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] ?? 0) + b.amount;
      return acc;
    }, {});

  const annualProjection = totalMonthly * 12;

  // Spending by category for pie chart — real data only
  const categoryChartData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Active vs Paused
  const activeBills = bills.filter((b) => b.billStatus === 'pending' || b.billStatus === 'overdue');
  const pausedBillsCount = bills.filter((b) => b.billStatus === 'cancelled').length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-700 text-foreground">{t.dashboard}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.goodMorning}, {userName} — {t.subscriptionOverview}
            </p>
          </div>
          <Link href="/add-subscription" className="btn-primary text-sm">
             {t.addSubscription}
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Hero card */}
              <div className="bg-primary rounded-xl p-5 sm:p-6 sm:col-span-2 border border-primary shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm font-600 text-blue-100 uppercase tracking-wider">{t.totalMonthlySpend}</p>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-800 text-white tabular-nums mb-2 break-all">{format(totalMonthly)}</p>
                <p className="text-sm text-blue-100">{bills.filter(b => b.billStatus !== 'cancelled').length} {t.bills.toLowerCase()}</p>
              </div>

              {/* Overdue */}
              <div className={`rounded-xl p-4 sm:p-5 border ${overdueBills.length > 0 ? 'bg-red-50 border-red-200' : 'card border'}`}>
                <div className="flex items-start justify-between mb-3">
                  <p className={`text-xs font-600 uppercase tracking-wider ${overdueBills.length > 0 ? 'text-red-700' : 'text-muted-foreground'}`}>{t.overdueBills}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${overdueBills.length > 0 ? 'bg-red-100' : 'bg-muted'}`}>
                    <AlertTriangle size={16} className={overdueBills.length > 0 ? 'text-red-600' : 'text-muted-foreground'} />
                  </div>
                </div>
                <p className={`text-2xl font-800 tabular-nums mb-1 ${overdueBills.length > 0 ? 'text-red-800' : ''}`}>{overdueBills.length}</p>
                <p className={`text-xs ${overdueBills.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {overdueBills.length > 0 ? `${format(overdueBills.reduce((a, b) => a + b.amount, 0))} total` : 'All clear!'}
                </p>
              </div>

              {/* Annual */}
              <div className="card rounded-xl p-4 sm:p-5 border">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-600 uppercase tracking-wider text-muted-foreground">{t.annualProjection}</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-800 tabular-nums mb-1 break-all">{format(annualProjection)}</p>
                <p className="text-xs text-muted-foreground">{t.basedOnCurrent}</p>
              </div>
            </div>

            {/* Analytics Section — Spending by Category only */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Spending by Category */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-700 text-foreground">Spending by Category</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Active subscriptions breakdown</p>
                  </div>
                </div>
                {categoryChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [format(value), 'Spend']}
                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Subscription Status */}
              <div className="card p-5 sm:p-6">
                <h2 className="text-base font-700 text-foreground mb-4">Subscription Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-600 text-emerald-800">Active</span>
                    </div>
                    <span className="text-xl font-800 text-emerald-700 tabular-nums">{activeBills.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                        <PauseCircle size={14} className="text-amber-600" />
                      </div>
                      <span className="text-sm font-600 text-amber-800">Cancelled</span>
                    </div>
                    <span className="text-xl font-800 text-amber-700 tabular-nums">{pausedBillsCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-600 text-emerald-800">Paid</span>
                    </div>
                    <span className="text-xl font-800 text-emerald-700 tabular-nums">{paidBills.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Renewals + Overdue Bills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Upcoming Renewals — single instance */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-700 text-foreground">{t.upcomingBills}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.next14Days}</p>
                  </div>
                  <Calendar size={16} className="text-muted-foreground" />
                </div>
                {upcomingBills.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t.noRenewals}</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBills.slice(0, 5).map((bill) => {
                      const days = getDaysUntil(bill.dueDate);
                      return (
                        <div
                          key={bill.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${days <= 3 ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
                              style={{ backgroundColor: CATEGORY_COLORS[bill.category] || '#6B7280' }}
                            >
                              {bill.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-600 text-foreground flex items-center gap-1.5 truncate">
                                {bill.title}
                                {days <= 3 && <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(bill.dueDate)}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
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

              {/* Overdue Bills */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-700 text-foreground">{t.overdueBills}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Requires immediate attention</p>
                  </div>
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                {overdueBills.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No overdue subscriptions!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueBills.slice(0, 5).map((bill) => {
                      const days = Math.abs(getDaysUntil(bill.dueDate));
                      return (
                        <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
                              style={{ backgroundColor: CATEGORY_COLORS[bill.category] || '#6B7280' }}
                            >
                              {bill.title.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-600 text-foreground truncate">{bill.title}</p>
                              <p className="text-xs text-red-600 font-500">{days}d overdue</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-700 text-red-700 tabular-nums">{format(bill.amount)}</p>
                            <Link href="/bills" className="text-xs text-primary hover:underline">{t.editBill}</Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Bills */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
                <h2 className="text-base font-700 text-foreground">{t.bills}</h2>
                <Link href="/bills" className="flex items-center gap-1.5 text-sm font-600 text-primary hover:text-blue-700 transition-colors">
                  {t.viewAll} <ArrowRight size={14} />
                </Link>
              </div>
              {bills.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Clock size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">{t.noBills}</p>
                  <Link href="/bills" className="btn-primary mt-3 text-sm inline-flex">+ {t.addBill}</Link>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">{t.billTitle}</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.category}</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">{t.amount}</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t.dueDate}</th>
                        <th className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wider">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bills.slice(0, 6).map((bill) => (
                        <tr key={bill.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 sm:px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-700 flex-shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[bill.category] || '#6B7280' }}
                              >
                                {bill.title.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm font-600 text-foreground truncate max-w-[120px] sm:max-w-none">{bill.title}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-500">{bill.category}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-700 text-foreground tabular-nums">{format(bill.amount)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{formatDate(bill.dueDate)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-xs font-600 px-2.5 py-1 rounded-full border ${
                              bill.billStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              bill.billStatus === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                              bill.billStatus === 'pending'? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {(t as any)[bill.billStatus]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}