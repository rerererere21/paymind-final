'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'SAR' | 'EUR' | 'GBP';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // relative to USD
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1 },
  { code: 'SAR', symbol: 'ر.س', label: 'SAR (ر.س)', rate: 3.75 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.92 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 0.79 },
];

interface CurrencyContextValue {
  currency: CurrencyOption;
  setCurrencyCode: (code: CurrencyCode) => void;
  format: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'paymind_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && CURRENCIES.find((c) => c.code === stored)) {
        setCurrencyCodeState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrencyCode = (code: CurrencyCode) => {
    setCurrencyCodeState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  };

  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const format = (usdAmount: number): string => {
    const converted = usdAmount * currency.rate;
    if (currency.code === 'SAR') {
      return `${converted.toFixed(2)} ${currency.symbol}`;
    }
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

