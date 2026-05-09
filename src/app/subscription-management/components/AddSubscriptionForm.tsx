'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Check } from 'lucide-react';

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

interface AddSubscriptionFormProps {
  onSubmit: (data: SubscriptionFormInputs & { nextBilling: string }) => void;
  onCancel: () => void;
  initialData?: Partial<SubscriptionFormInputs>;
}

const categories = [
  'Entertainment',
  'Productivity',
  'Cloud Storage',
  'Health',
  'News & Media',
  'Developer Tools',
  'Education',
  'Finance',
  'Design',
  'Other',
];

const billingCycles = ['Monthly', 'Annual', 'Quarterly', 'Weekly'];
const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'trial', label: 'Free Trial' },
];

export default function AddSubscriptionForm({ onSubmit, onCancel, initialData }: AddSubscriptionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormInputs>({
    defaultValues: {
      name: initialData?.name ?? '',
      price: initialData?.price ?? undefined,
      billingCycle: initialData?.billingCycle ?? 'Monthly',
      category: initialData?.category ?? 'Entertainment',
      startDate: initialData?.startDate ?? '',
      status: initialData?.status ?? 'active',
      website: initialData?.website ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  const [saved, setSaved] = useState(false);
  const billingCycle = watch('billingCycle');
  const price = watch('price');

  const monthlyEquiv = billingCycle === 'Annual'
    ? price ? `($${(price / 12).toFixed(2)}/mo)` : ''
    : billingCycle === 'Quarterly'
    ? price ? `($${(price / 3).toFixed(2)}/mo)` : '' :'';

  const onFormSubmit = async (data: SubscriptionFormInputs) => {
    // Backend: POST /api/subscriptions (add) or PUT /api/subscriptions/:id (edit)
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit({ ...data, nextBilling: initialData ? (initialData as any).nextBilling ?? 'Jun 1, 2026' : 'Jun 1, 2026' });
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
          <Check size={26} className="text-emerald-600" />
        </div>
        <p className="text-base font-700 text-foreground">Subscription saved!</p>
        <p className="text-sm text-muted-foreground">Your subscription list has been updated.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="px-6 py-5 space-y-5">
        {/* Section: Basic Info */}
        <div>
          <h3 className="text-sm font-700 text-foreground mb-3 flex items-center gap-2">
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
              <select
                id="sub-category"
                className="input-field"
                {...register('category', { required: 'Category is required' })}
              >
                {categories.map((cat) => (
                  <option key={`cat-opt-${cat}`} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-600 font-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sub-status" className="block text-sm font-600 text-foreground">Status</label>
              <select
                id="sub-status"
                className="input-field"
                {...register('status')}
              >
                {statuses.map((s) => (
                  <option key={`status-opt-${s.value}`} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sub-website" className="block text-sm font-600 text-foreground">Website</label>
              <p className="text-xs text-muted-foreground">Optional — helps identify the service</p>
              <input
                id="sub-website"
                type="text"
                placeholder="e.g. netflix.com"
                className="input-field"
                {...register('website')}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Section: Billing */}
        <div>
          <h3 className="text-sm font-700 text-foreground mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-700">2</span>
            Billing Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="sub-price" className="block text-sm font-600 text-foreground">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              {monthlyEquiv && (
                <p className="text-xs text-muted-foreground">Monthly equivalent: {monthlyEquiv}</p>
              )}
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
              <p className="text-xs text-muted-foreground">How often you are charged</p>
              <select
                id="sub-cycle"
                className="input-field"
                {...register('billingCycle', { required: true })}
              >
                {billingCycles.map((c) => (
                  <option key={`cycle-opt-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sub-start" className="block text-sm font-600 text-foreground">
                Start date <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground">When you first subscribed</p>
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

        {/* Section: Notes */}
        <div>
          <h3 className="text-sm font-700 text-foreground mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-700">3</span>
            Notes
          </h3>
          <div className="space-y-1.5">
            <label htmlFor="sub-notes" className="block text-sm font-600 text-foreground">Personal notes</label>
            <p className="text-xs text-muted-foreground">Reminders, trial end dates, or reasons to keep/cancel</p>
            <textarea
              id="sub-notes"
              rows={3}
              placeholder="e.g. Trial ends May 28 — decide whether to keep before then"
              className="input-field resize-none"
              {...register('notes')}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : (
            initialData?.name ? 'Save changes' : 'Add subscription'
          )}
        </button>
      </div>
    </form>
  );
}