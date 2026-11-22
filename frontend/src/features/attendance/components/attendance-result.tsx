
interface AttendanceResultProps {
  message: string;
  onReset: () => void;
}

export function AttendanceResult({
  message,
  onReset,
}: AttendanceResultProps) {
  return (
    <section className="result-panel result-success">
      <div className="result-icon">✓</div>

      <div className="result-information">
        <span className="result-label">
          VERIFICACIÓN EXITOSA
        </span>

        <h2>Identidad verificada</h2>

        <p>{message}</p>

        <small>
          La identidad fue reconocida. El registro de asistencia
          se integrará en la siguiente etapa.
        </small>
      </div>

      <button className="btn-retry" onClick={onReset}>
        Nuevo registro
      </button>
    </section>
  );
}
