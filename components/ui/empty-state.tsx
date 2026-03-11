import { Button } from "./button";

interface EmptyStateProps {
  message: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ message, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium mb-1">{message}</p>
      {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
      {actionLabel && actionHref && (
        <a href={actionHref}>
          <Button variant="secondary" size="sm">{actionLabel}</Button>
        </a>
      )}
    </div>
  );
}
