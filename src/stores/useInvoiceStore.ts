import { create } from 'zustand';
import type { Invoice } from '../types';
import { supabase } from '../lib/supabase';

let _channel: ReturnType<typeof supabase.channel> | null = null;

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  load: () => void;
  create: (invoice: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  setCurrent: (invoice: Invoice | null) => void;
  initRealtime: () => () => void;
}

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    items: (row.items || []) as Invoice['items'],
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at as string,
    exportedAs: (row.exported_as as Invoice['exportedAs']) || undefined,
    status: (row.status as Invoice['status']) || 'pending',
  };
}

function invoiceToRow(inv: Invoice) {
  return {
    id: inv.id,
    customer_name: inv.customerName,
    items: inv.items,
    total_amount: inv.totalAmount,
    exported_as: inv.exportedAs || null,
    status: inv.status,
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

  updateInvoice: (id, data) => {
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...data } : inv
      ),
    }));
    const merged = { ...get().invoices.find((i) => i.id === id)!, ...data };
    supabase.from('invoices').update(invoiceToRow(merged)).eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to update invoice:', error);
    });
  },

  setCurrent: (invoice) => set({ currentInvoice: invoice }),

  initRealtime: () => {
    if (_channel) return () => {};

    const cleanup = () => {
      if (_channel) {
        supabase.removeChannel(_channel);
        _channel = null;
      }
    };

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      _channel = supabase
        .channel('invoices-realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'invoices',
        }, (payload) => {
          const inv = rowToInvoice(payload.new as Record<string, unknown>);
          set((state) => {
            if (state.invoices.some((i) => i.id === inv.id)) return state;
            return { invoices: [inv, ...state.invoices] };
          });
        })
        .subscribe();
    })();

    return cleanup;
  },
}));
