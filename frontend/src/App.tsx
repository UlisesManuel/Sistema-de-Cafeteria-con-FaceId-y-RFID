
import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

// Layout
import { AttendanceHeader } from './components/layout/attendance-header';
import { AttendanceFooter } from './components/layout/attendance-footer';

// Attendance
import { useRfid } from './features/attendance/hooks/use-rfid';
import { RfidPanel } from './features/attendance/components/rfid-panel';
import { FacialPanel } from './features/attendance/components/panel-facial';
import { AttendanceAlert } from './features/attendance/components/attendance-alert';
import { AttendanceResult } from './features/attendance/components/attendance-result';

// Types
import type {
  AttendanceStatus,
  RfidStatus,
  RespuestaAPI,
} from './features/attendance/types/attendance.types';

function App() {
  // Referencias de cámara y canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estado RFID
  const [rfidStatus, setRfidStatus] = useState<RfidStatus>('waiting');
  const [rfidUid, setRfidUid] = useState('');

  // Estado general de asistencia
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>('WAITING_RFID');

  // Estado de cámara
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState(
    'Inicializando cámara...'
  );

  // Resultado de reconocimiento facial
  const [identityMessage, setIdentityMessage] = useState('');
  const [rostros, setRostros] = useState(0);

  // Procesar lectura RFID
  const handleRfidRead = useCallback((uid: string) => {
    // Evitar procesar otra tarjeta durante una validación
    if (attendanceStatus !== 'WAITING_RFID') return;

    setRfidUid(uid);
    setRfidStatus('success');

    setIdentityMessage('');
    setRostros(0);

    // Por ahora aceptamos la lectura para continuar
    // Posteriormente validaremos el UID mediante FastAPI.
    setAttendanceStatus('WAITING_FACE');

    console.log('UID RFID recibido:', uid);
  }, [attendanceStatus]);

  // Hook de lectura RFID
  const {
    uid,
    handleChange,
    clearReading,
  } = useRfid({
    onRead: handleRfidRead,
    delay: 150,
    expectedLength: 10,
  });

  // Inicializar cámara
  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    const initializeCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('El navegador no permite acceder a la cámara.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraReady(true);
        setCameraMessage('Sistema activo. Colócate frente a la cámara.');
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);

        if (mounted) {
          setCameraReady(false);
          setCameraMessage('No se pudo acceder a la cámara.');
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Reiniciar proceso
  const resetAttendance = () => {
    clearReading();

    setRfidUid('');
    setRfidStatus('waiting');
    setAttendanceStatus('WAITING_RFID');

    setIdentityMessage('');
    setRostros(0);
  };

  // Capturar imagen y enviarla al backend
  const captureAndValidate = async (): Promise<void> => {
    if (attendanceStatus !== 'WAITING_FACE') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraReady) {
      setAttendanceStatus('REJECTED');
      setIdentityMessage('La cámara no está disponible.');
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setAttendanceStatus('REJECTED');
      setIdentityMessage(
        'La cámara todavía no está lista. Intenta nuevamente.'
      );
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      setAttendanceStatus('REJECTED');
      setIdentityMessage('No se pudo procesar la imagen de la cámara.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setAttendanceStatus('VERIFYING_FACE');
    setIdentityMessage('Estamos verificando tu identidad...');
    setCameraMessage('Enviando captura al servidor...');

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error('No se pudo generar la captura.'));
            }
          },
          'image/jpeg',
          0.9
        );
      });

      const formData = new FormData();
      formData.append('file', blob, 'captura.jpg');

      const response = await fetch(
        'http://localhost:8000/api/detectar-rostro/',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data: RespuestaAPI = await response.json();

      if (!response.ok) {
        throw new Error('El servidor rechazó la solicitud.');
      }

      setRostros(data.rostros_encontrados);

      const recognized =
        data.identidad?.includes('Bienvenido') ?? false;

      if (recognized) {
        setAttendanceStatus('SUCCESS');
        setIdentityMessage(
          data.identidad ?? 'Identidad verificada.'
        );
        setCameraMessage('Reconocimiento facial completado.');
      } else {
        setAttendanceStatus('REJECTED');
        setIdentityMessage(
          data.identidad || 'No se pudo reconocer tu identidad.'
        );
        setCameraMessage('No se pudo verificar la identidad.');
      }
    } catch (error) {
      console.error('Error durante el reconocimiento facial:', error);

      setAttendanceStatus('REJECTED');

      setIdentityMessage(
        error instanceof Error
          ? error.message === 'Failed to fetch'
            ? 'No fue posible conectar con el servidor de reconocimiento facial.'
            : error.message
          : 'Ocurrió un error durante la validación.'
      );

      setCameraMessage('Error durante la comunicación con el servidor.');
    }
  };

  return (
    <div className="app-container">
      <AttendanceHeader />

      <main className="main-content">
        <div className="verification-grid">
          <RfidPanel
            status={rfidStatus}
            uid={uid}
            onChange={handleChange}
          />

          <FacialPanel
            status={attendanceStatus}
            cameraReady={cameraReady}
            cameraMessage={cameraMessage}
            rostros={rostros}
            identityMessage={identityMessage}
            videoRef={videoRef}
            canvasRef={canvasRef}
            onValidate={captureAndValidate}
          />
        </div>

        {attendanceStatus === 'REJECTED' && (
          <AttendanceAlert
            message={identityMessage}
            onRetry={resetAttendance}
          />
        )}

        {attendanceStatus === 'SUCCESS' && (
          <AttendanceResult
            message={identityMessage}
            onReset={resetAttendance}
          />
        )}
      </main>

      <AttendanceFooter />
    </div>
  );
}

export default App;
