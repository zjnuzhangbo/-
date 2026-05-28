interface BadgeProps {
  variant: 'pending' | 'priced' | 'active' | 'inactive';
  label?: string;
}

const styles: Record<BadgeProps['variant'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  priced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-red-50 text-red-600 border-red-200',
};

const defaultLabels: Record<BadgeProps['variant'], string> = {
  pending: '待核算',
  priced: '已核算',
  active: '上架',
  inactive: '下架',
};

export default function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${styles[variant]}`}>
      {label || defaultLabels[variant]}
    </span>
  );
}
