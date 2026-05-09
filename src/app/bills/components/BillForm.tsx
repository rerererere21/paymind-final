'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Check, X } from 'lucide-react';
import { BillCategory, BillStatus, CreateBillInput } from '@/lib/services/billService';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslations } from '@/lib/i18n';

const CATEGORIES: BillCategory[] = [
  'Housing', 'Utilities', 'Insurance', 'Subscriptions',
  'Healthcare', 'Transportation', 'Education', 'Entertainment',
  'Food', 'Finance', 'Other',
];

const STATUSES: { value: BillStatus; labelKey: string }[] = [
  { value: 'pending', labelKey: 'pending' },
  { value: 'paid', labelKey: 'paid' },
  { value: 'overdue', labelKey: 'overdue' },
  { value: 'cancelled', labelKey: 'cancelled' },
];

interface BillFormInputs {
  title: string;
  amount: number;
  dueDate: string;
  billStatus: BillStatus;
  category: BillCategory;
  notes?: string;
  isRecurring: boolean;
}

interface BillFormProps {
  onSubmit: (data: CreateBillInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<BillFormInputs>;
  mode?: 'add' | 'edit';
}

export default function BillForm({ onSubmit, onCancel, initialData, mode = 'add' }: BillFormProps) {
  const { language } = useLanguage();
  const t = getTranslations(language);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillFormInputs>({
    defaultValues: {
      title: initialData?.title ?? '',
      amount: initialData?.amount ?? undefined,
      dueDate: initialData?.dueDate ?? '',
      billStatus: initialData?.billStatus ?? 'pending',
      category: initialData?.category ?? 'Other',
      notes: initialData?.notes ?? '',
      isRecurring: initialData?.isRecurring ?? false,
    },
  });

  const onFormSubmit = async (data: BillFormInputs) => {
    await onSubmit({
      title: data.title,
      amount: data.amount,
      dueDate: data.dueDate,
      billStatus: data.billStatus,
      category: data.category,
      notes: data.notes,
      isRecurring: data.isRecurring,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3 animate-fadeIn">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
          <Check size={26} className="text-emerald-600" />
        </div>
        <p className="text-base font-700 text-foreground">{t.billSaved}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="px-6 py-5 space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600 text-foreground">
            {t.billTitle} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Netflix, Spotify"
            className="input-field"
            {...register('title', { required: 'Title is required', minLength: { value: 2, message: 'Too short' } })}
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-sm font-600 text-foreground">
              {t.amount} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input-field pl-7 tabular-nums"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Must be greater than 0' },
                  valueAsNumber: true,
                })}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-600 text-foreground">
              {t.dueDate} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="input-field"
              {...register('dueDate', { required: 'Renewal date is required' })}
            />
            {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate.message}</p>}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-sm font-600 text-foreground">{t.status}</label>
            <select className="input-field" {...register('billStatus')}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {(t as any)[s.labelKey]}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-600 text-foreground">{t.category}</label>
            <select className="input-field" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-600 text-foreground">{t.notes}</label>
          <textarea
            rows={2}
            placeholder="Optional notes..."
            className="input-field resize-none"
            {...register('notes')}
          />
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-2">
          <input
            id="is-recurring"
            type="checkbox"
            className="w-4 h-4 rounded border-border accent-primary"
            {...register('isRecurring')}
          />
          <label htmlFor="is-recurring" className="text-sm text-muted-foreground">
            Recurring subscription
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2">
          <X size={15} /> {t.cancel}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
          {isSubmitting ? (
            <><Loader2 size={15} className="animate-spin" /> {t.save}...</>
          ) : (
            <><Check size={15} /> {t.save}</>
          )}
        </button>
      </div>
    </form>
  );
}
