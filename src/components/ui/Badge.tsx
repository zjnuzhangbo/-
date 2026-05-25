interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent';
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-50 text-primary',
  accent: 'bg-accent/10 text-accent',
};

export default function Badge({ children, variant = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
