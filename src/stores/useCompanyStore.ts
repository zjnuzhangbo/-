import { create } from 'zustand';
import type { Company } from '../types';
import { supabase } from '../lib/supabase';
import { defaultCompany } from '../utils/seedData';

interface CompanyState {
  company: Company;
  load: () => void;
  update: (data: Partial<Company>) => void;
}

function rowToCompany(row: Record<string, unknown>): Company {
  return {
    name: (row.name || defaultCompany.name) as Company['name'],
    phone: (row.phone || defaultCompany.phone) as string,
    wechatQR: (row.wechat_qr || '') as string,
    address: row.address as Company['address'],
  };
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: defaultCompany,

  load: () => {
    (async () => {
      const { data, error } = await supabase
        .from('company')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        set({ company: rowToCompany(data) });
      } else {
        console.error('Failed to load company:', error);
      }
    })();
  },

  update: (partial) => {
    const next = { ...get().company, ...partial };
    set({ company: next });

    const row: Record<string, unknown> = {};
    if (partial.name) row.name = partial.name;
    if (partial.phone !== undefined) row.phone = partial.phone;
    if (partial.wechatQR !== undefined) row.wechat_qr = partial.wechatQR;
    if (partial.address) row.address = partial.address;

    supabase.from('company').update(row).eq('id', 1).then(({ error }) => {
      if (error) console.error('Failed to update company:', error);
    });
  },
}));
