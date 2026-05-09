'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionFormInputs {
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual' | 'Quarterly' | 'Weekly';
  category: string;
  startDate: string;
  status: 'active' | 'paused' | 'trial';
  website?: string;
  notes?: string;
}

const categories = [
  'Entertainment', 'Productivity', 'Cloud Storage', 'Health',
  'News & Media', 'Developer Tools', 'Education', 'Finance', 'Design', 'Other',
];
const billingCycles = ['Monthly', 'Annual', 'Quarterly', 'Weekly'];
const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'trial', label: 'Free Trial' },
];

export default function AddSubscriptionPage() {
  const { addSubscription } = useSubscriptions();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormInputs>({
    defaultValues: {
      billingCycle: 'Monthly',
      category: 'Entertainment',
      status: 'active',
    },
  });

  const billingCycle = watch('billingCycle');
  const price = watch('price');

  const monthlyEquiv =
    billingCycle === 'Annual' && price ? `($${(price / 12).toFixed(2)}/mo)` :
    billingCycle === 'Quarterly' && price ? `($${(price / 3).toFixed(2)}/mo)` : '';

  const onFormSubmit = async (data: SubscriptionFormInputs) => {
    setSaveError('');
    try {
      await addSubscription({
        name: data.name,
        price: data.price,
        billingCycle: data.billingCycle,
        category: data.category,
        startDate: data.startDate,
        status: data.status,
        website: data.website,
        notes: data.notes,
        nextBilling: '',
        color: '',
        daysUntil: 0,
      });
      setSaved(true);
      setTimeout(() => {
        router.push('/subscription-management');
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save subscription. Please try again.');
    }
  };

  if (saved) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto py-20 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-700 text-foreground">Subscription added!</h2>
          <p className="text-sm text-muted-foreground">Redirecting to your subscriptions list...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/subscription-management" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-700 text-foreground">Add Subscription</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track a new recurring service</p>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-500">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <div className="card p-6 space-y-6">
            {/* Section 1: Service Details */}
            <div>
              <h3 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-700">1</span>
                Service Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="sub-name" className="block text-sm font-600 text-foreground">
                    Service name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sub-name"
                    type="text"
                    placeholder="e.g. Netflix, Spotify, AWS"
                    className="input-field"
                    {...register('name', { required: 'Service name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                  />
                  {errors.name && <p className="text-xs text-red-600 font-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sub-category" className="block text-sm font-600 text-foreground">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select id="sub-category" className="input-field" {...register('category', { required: true })}>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sub-status" className="block text-sm font-600 text-foreground">Status</label>
                  <select id="sub-status" className="input-field" {...register('status')}>
                    {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="sub-website" className="block text-sm font-600 text-foreground">Website <span className="text-muted-foreground font-400">(optional)</span></label>
                  <input id="sub-website" type="text" placeholder="e.g. netflix.com" className="input-field" {...register('website')} />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Section 2: Billing */}
            <div>
              <h3 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-700">2</span>
                Billing Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="sub-price" className="block text-sm font-600 text-foreground">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  {monthlyEquiv && <p className="text-xs text-muted-foreground">Monthly equivalent: {monthlyEquiv}</p>}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-500">$</span>
                    <input
                      id="sub-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="input-field pl-7 tabular-nums"
                      {...register('price', {
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' },
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-red-600 font-500">{errors.price.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sub-cycle" className="block text-sm font-600 text-foreground">
                    Billing cycle <span className="text-red-500">*</span>
                  </label>
                  <select id="sub-cycle" className="input-field" {...register('billingCycle', { required: true })}>
                    {billingCycles.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="sub-start" className="block text-sm font-600 text-foreground">
                    Start date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sub-start"
                    type="date"
                    className="input-field"
                    {...register('startDate', { required: 'Start date is required' })}
                  />
                  {errors.startDate && <p className="text-xs text-red-600 font-500">{errors.startDate.message}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Section 3: Notes */}
            <div>
              <h3 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-700">3</span>
                Notes <span className="text-muted-foreground font-400 text-xs">(optional)</span>
              </h3>
              <textarea
                id="sub-notes"
                rows={3}
                placeholder="e.g. Trial ends soon — decide whether to keep before then"
                className="input-field resize-none"
                {...register('notes')}
              />
            </div>

            <p className="text-xs text-muted-foreground"><span className="text-red-500">*</span> Required fields</p>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Link href="/subscription-management" className="btn-secondary">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Check size={16} /> Add Subscription</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
