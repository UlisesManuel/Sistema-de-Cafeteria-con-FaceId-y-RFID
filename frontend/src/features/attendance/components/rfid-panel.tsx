
import type { RfidStatus } from '../types/attendance.types';

interface RfidPanelProps {
  status: RfidStatus;
  uid: string;
  onChange: (value: string) => void;
}

export function RfidPanel({
  status,
  uid,
  onChange,
}: RfidPanelProps) {
  return (
    <section className="rfid-panel">
      <h2>Identificación RFID</h2>

      <p>
        Acerca tu tarjeta al lector para identificarte.
      </p>

      <div className="rfid-reader">
        <div className="rfid-icon">
          <span>RFID</span>
        </div>

        <p>
          {status === 'success'
            ? 'Tarjeta leída correctamente'
            : 'Esperando lectura de tarjeta...'}
        </p>

        <input
          type="text"
          value={uid}
          onChange={(event) => onChange(event.target.value)}
          maxLength={10}
          inputMode="none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Lectura de tarjeta RFID"
          placeholder="Acerca tu tarjeta"
        />
      </div>
    </section>
  );
}
