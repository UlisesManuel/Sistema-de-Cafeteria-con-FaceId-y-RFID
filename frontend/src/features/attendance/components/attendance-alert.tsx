
interface AttendanceAlertProps {
  message: string;
  onRetry: () => void;
}

export function AttendanceAlert({
  message,
  onRetry,
}: AttendanceAlertProps) {
  return (
    <section className="result-panel result-error">
      <div className="result-icon">!</div>

      <div className="result-information">
        <span className="result-label">
          ERROR DE AUTENTICACIÓN DE ACCESO
        </span>

        <h2>Identidad no verificada</h2>
        <p>{message}</p>
      </div>

      <button className="btn-retry" onClick={onRetry}>
        Reintentar
      </button>
    </section>
  );
}
