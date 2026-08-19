interface LoadingStateProps {
  label?: string;
}

/** Accessible loading indicator with a status role. */
export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <p className="loading__label">{label}</p>
    </div>
  );
}
