
import type { RefObject } from 'react';
import type { AttendanceStatus } from '../types/attendance.types';

interface FacialPanelProps {
  status: AttendanceStatus;
  cameraReady: boolean;
  cameraMessage: string;
  rostros: number;
  identityMessage: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onValidate: () => void;
}

export function FacialPanel({
  status,
  cameraReady,
  cameraMessage,
  rostros,
  identityMessage,
  videoRef,
  canvasRef,
  onValidate,
}: FacialPanelProps) {
  const getFaceMessage = () => {
    switch (status) {
      case 'WAITING_RFID':
        return 'Primero presente su credencial RFID.';

      case 'WAITING_FACE':
        return 'Credencial validada. Colóquese frente a la cámara.';

      case 'VERIFYING_FACE':
        return 'Verificando identidad, espere un momento...';

      case 'SUCCESS':
        return identityMessage;

      case 'REJECTED':
        return 'La verificación facial no fue exitosa.';

      default:
        return '';
    }
  };

  const getAlertClass = () => {
    switch (status) {
      case 'WAITING_RFID':
        return 'alert-waiting';

      case 'WAITING_FACE':
      case 'VERIFYING_FACE':
        return 'alert-info';

      case 'SUCCESS':
        return 'alert-success';

      default:
        return '';
    }
  };

  return (
    <section className="split-panel face-panel">
      <div className="panel-heading">
        <h2>Reconocimiento Facial</h2>
        <span className="heading-line" />
      </div>

      <p className="system-status">
        <strong>Estado:</strong> {cameraMessage}
      </p>

      <div className={`face-alert ${getAlertClass()}`}>
        {getFaceMessage()}
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-feed"
        />

        {!cameraReady && (
          <div className="camera-placeholder">
            <span className="camera-icon">▣</span>
            <p>Cámara no disponible</p>
          </div>
        )}

        <div className="camera-frame">
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
        </div>

        <div className="camera-label">
          CAM_01 · CAPTURA ACTIVA
        </div>

        <div className="camera-score">
          ROSTROS: {rostros}
        </div>
      </div>

      <button
        className="btn-validate"
        onClick={onValidate}
        disabled={status !== 'WAITING_FACE' || !cameraReady}
      >
        ◉ Validar mi identidad
      </button>

      <canvas ref={canvasRef} hidden />
    </section>
  );
}
