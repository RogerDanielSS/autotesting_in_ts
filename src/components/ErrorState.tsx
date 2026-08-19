interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/** Accessible error panel with a retry action. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error" role="alert">
      <p className="error__message">{message}</p>
      <button type="button" className="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
