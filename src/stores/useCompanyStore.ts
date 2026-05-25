import { create } from 'zustand';
import type { Company } from '../types';
import { defaultCompany } from '../utils/seedData';

interface CompanyState {
  company: Company;
  load: () => void;
  update: (data: Partial<Company>) => void;
}

const KEY = 'tricycle_company';

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: defaultCompany,
  load: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      set({ company: JSON.parse(raw) });
    } else {
      localStorage.setItem(KEY, JSON.stringify(defaultCompany));
      set({ company: defaultCompany });
    }
  },
  update: (data) => {
    const next = { ...get().company, ...data };
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ company: next });
  },
}));
