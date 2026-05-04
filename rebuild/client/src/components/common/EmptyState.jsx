export default function EmptyState({ title = "Nothing here", subtitle = "Try something else", icon: Icon, action }) {
  return (
    <div className="text-center py-20">
      {Icon && <Icon className="w-24 h-24 text-nayamo-text-muted mx-auto mb-6 opacity-40" />}
      <h3 className="text-2xl font-semibold text-nayamo-text-primary mb-2">{title}</h3>
      <p className="text-nayamo-text-muted mb-8 max-w-md mx-auto">{subtitle}</p>
      {action}
    </div>
  );
}

