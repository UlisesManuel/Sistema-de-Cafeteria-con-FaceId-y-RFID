import React, { useRef, useState, useEffect } from 'react';
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [mensaje, setMensaje] = useState<string>("Cámara inactiva");
  const [rostros, setRostros] = useState<number>(0);
  const [identidadDetectada, setIdentidadDetectada] = useState<string>("Esperando escaneo...");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setMensaje("Sistema de Acceso Activo. Colócate frente a la cámara.");
        }
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
        setMensaje("No se pudo acceder a la cámara.");
      });
  }, []);

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

      setMensaje("Validando identidad en el almacén...");

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

  // Validar si fue reconocido exitosamente para cambiar estilos del cartel
  const esReconocido = identidadDetectada.includes("¡Bienvenido");

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', marginTop: '30px' }}>
      <h1>Control de Acceso por Reconocimiento Facial</h1>
      <p><b>Estado del Sistema:</b> {mensaje}</p>

      {/* Cartel de Bienvenida Dinámico */}
      <div style={{ 
        margin: '20px auto', 
        padding: '20px', 
        width: '500px', 
        borderRadius: '12px', 
        backgroundColor: esReconocido ? '#DEF7EC' : '#FDE8E8',
        color: esReconocido ? '#03543F' : '#9B1C1C',
        fontSize: '20px',
        fontWeight: 'bold',
        border: `2px solid ${esReconocido ? '#31C48D' : '#F8B4B4'}`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {identidadDetectada}
      </div>

      <div style={{ margin: '20px auto', display: 'inline-block', position: 'relative' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '640px', borderRadius: '8px', border: '2px solid #ccc' }} 
        />
      </div>

      <div>
        <button 
          onClick={capturarYValidar}
          style={{ 
            padding: '12px 25px', 
            fontSize: '18px', 
            backgroundColor: '#4F46E5', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Validar mi Identidad
        </button>
      </div>

      {/* Canvas corregido */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;