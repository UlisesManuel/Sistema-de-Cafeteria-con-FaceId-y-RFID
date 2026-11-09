import { useRef, useState, useEffect } from 'react';
import './App.css';

interface CoordenadaRostro {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
interface RespuestaAPI {
  status: string;
  rostros_encontrados: number;
  identidad?: string;
  coordenadas: CoordenadaRostro[];
}

function App() {
  // ================= ESTADOS RFID (MOCK) =================
  const [rfidStatus, setRfidStatus] = useState<'waiting' | 'success' | 'error'>('waiting');

  const simulateRfidScan = (status: 'success' | 'error') => {
    setRfidStatus(status);
    setTimeout(() => setRfidStatus('waiting'), 3000); 
  };

  // ================= ESTADOS FACESCAN =================
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [mensaje, setMensaje] = useState<string>("Cámara inactiva");
  const [rostros, setRostros] = useState<number>(0);
  const [identidadDetectada, setIdentidadDetectada] = useState<string>("Esperando escaneo...");

  // Inicializar cámara
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setMensaje("Sistema Activo. Colócate frente a la cámara.");
        }
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
        setMensaje("No se pudo acceder a la cámara.");
      });
  }, []);

  // Función de captura y envío a API
  const capturarYValidar = async (): Promise<void> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "captura.jpg");

      setMensaje("Validando identidad en el servidor...");

      try {
        const response = await fetch("http://localhost:8000/api/detectar-rostro/", {
          method: "POST",
          body: formData,
        });

        const data: RespuestaAPI = await response.json();

        if (response.ok) {
          setRostros(data.rostros_encontrados);
          if (data.identidad) {
            setIdentidadDetectada(data.identidad);
          }
          setMensaje("Escaneo completado.");
        } else {
          setMensaje("Error en el servidor.");
        }
      } catch (error) {
        console.error("Error de red:", error);
        setMensaje("Error de conexión con el backend.");
      }
    }, 'image/jpeg');
  };

  const esReconocido = identidadDetectada.includes("¡Bienvenido") || identidadDetectada.includes("Bienvenido");

  return (
    <div className="app-container">
      {/* ENCABEZADO UNSIS */}
      <header className="app-header">
        <h1>Sistema de Cafetería - UNSIS</h1>
        <p>Verificación de Acceso mediante FaceScan y RFID</p>
      </header>

      <main className="main-content">
        
        {/* ================= COLUMNA IZQUIERDA: Lector RFID ================= */}
        <section className="split-panel">
          <h2>Verificación RFID</h2>
          
          <div className={`status-box ${rfidStatus}`}>
            {rfidStatus === 'waiting' && (
              <>
                <div className="icon pulse"></div>
                <p>Acerque su credencial al lector.</p>
              </>
            )}
            {rfidStatus === 'success' && (
              <>
                <div className="icon success"></div>
                <p>¡Verificación exitosa!<br/>Acceso autorizado.</p>
              </>
            )}
            {rfidStatus === 'error' && (
              <>
                <div className="icon error"></div>
                <p>Credencial no reconocida o sin saldo.<br/>Intente de nuevo.</p>
              </>
            )}
          </div>
          
          {/* Controles Mock Temporales */}
          <div className="mock-controls">
            <p className="mock-title">Controles de Simulación (Mock)</p>
            <button onClick={() => simulateRfidScan('success')} className="btn-success">Simular Éxito</button>
            <button onClick={() => simulateRfidScan('error')} className="btn-error">Simular Error</button>
          </div>
        </section>

        {/* ================= COLUMNA DERECHA: FaceScan ================= */}
        <section className="split-panel">
          <h2>Reconocimiento Facial</h2>
          
          <p className="system-status"><b>Estado:</b> {mensaje}</p>

          {/* Cartel de Bienvenida Dinámico */}
          <div className={`face-alert ${esReconocido ? 'alert-success' : 'alert-waiting'}`}>
            {identidadDetectada}
          </div>

          <div className="video-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="video-feed"
            />
          </div>

          <button onClick={capturarYValidar} className="btn-validate">
            Validar mi Identidad
          </button>

          {/* Canvas oculto para procesar la imagen */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </section>

      </main>
    </div>
  );
}

export default App;