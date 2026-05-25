import { create } from 'zustand';
import type { Invoice } from '../types';
import { supabase } from '../lib/supabase';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  load: () => void;
  create: (invoice: Invoice) => void;
  setCurrent: (invoice: Invoice | null) => void;
}

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    items: (row.items || []) as Invoice['items'],
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at as string,
    exportedAs: (row.exported_as as Invoice['exportedAs']) || undefined,
  };
}

function invoiceToRow(inv: Invoice) {
  return {
    id: inv.id,
    customer_name: inv.customerName,
    items: inv.items,
    total_amount: inv.totalAmount,
    exported_as: inv.exportedAs || null,
  };
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,

  load: () => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        set({ invoices: data.map(rowToInvoice) });
      } else {
        console.error('Failed to load invoices:', error);
      }
    })();
  },

  create: (invoice) => {
    set({
      invoices: [invoice, ...get().invoices],
      currentInvoice: invoice,
    });
    supabase.from('invoices').insert(invoiceToRow(invoice)).then(({ error }) => {
      if (error) console.error('Failed to save invoice:', error);
    });
  },

  setCurrent: (invoice) => set({ currentInvoice: invoice }),
}));
