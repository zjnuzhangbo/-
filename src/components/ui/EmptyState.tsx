interface Props {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '📭', title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
  );
}
