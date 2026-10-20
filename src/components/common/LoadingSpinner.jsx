export default function LoadingSpinner({ text = 'Loading editorial collection...' }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="editorial-spinner" aria-hidden="true" />
      <span className="loading-text">{text}</span>
    </div>
  );
}
