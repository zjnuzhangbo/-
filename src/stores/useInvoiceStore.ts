import { create } from 'zustand';
import type { Invoice } from '../types';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  load: () => void;
  create: (invoice: Invoice) => void;
  setCurrent: (invoice: Invoice | null) => void;
}

const KEY = 'tricycle_invoices';

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  load: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) set({ invoices: JSON.parse(raw) });
  },
  create: (invoice) => {
    const next = [invoice, ...get().invoices];
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ invoices: next, currentInvoice: invoice });
  },
  setCurrent: (invoice) => set({ currentInvoice: invoice }),
}));
