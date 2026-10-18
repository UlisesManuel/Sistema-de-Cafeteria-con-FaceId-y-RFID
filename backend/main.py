import os
import cv2
import face_recognition
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


rostros_conocidos_encodings = []
nombres_conocidos = []

directorio_actual = os.path.dirname(__file__)
usuarios_prueba = {
    "Manuel": "manuel.jpg",
    "Rey": "rey.jpg",
    "Raziel": "raz.jpg",
    "Brisa":"brisa.jpg",
    "Aquino":"david-a.jpg",
    "Canseco":"david-c.jpg",
    "Diana":"diana.jpg",
    "Guadalupe":"guadalaupe.jpg",
    "Irving":"irving.jpg",
    "Ivan":"ivan.jpg",
    "Joaquin":"joaquin.jpg",
    "luz":"luz.jpg",
    "luz":"luz.jpg",
}

for nombre, archivo in usuarios_prueba.items():
  ruta_imagen = os.path.join(directorio_actual, archivo)
  if os.path.exists(ruta_imagen):
    try:
      imagen_ref = face_recognition.load_image_file(ruta_imagen)
      encodings = face_recognition.face_encodings(imagen_ref)
      if len(encodings) > 0:
        rostros_conocidos_encodings.append(encodings[0])
        nombres_conocidos.append(nombre)
        print(f">>> Rostro de '{nombre}' cargado correctamente desde {archivo}")
    except Exception as e:
      print(f">>> Error al cargar {archivo}: {e}")
  else:
    print(
        f">>> Aviso: No se encontró el archivo {archivo} para el usuario"
        f" {nombre}"
    )


@app.post("/api/detectar-rostro/")
async def detectar_rostro(file: UploadFile = File(...)):
  try:
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
      return {"status": "error", "detail": "No se pudo decodificar la imagen"}

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(
        rgb_img, number_of_times_to_upsample=1
    )

    if not face_locations:
      return {
          "status": "success",
          "rostros_encontrados": 0,
          "identidad": "Nadie detectado",
          "coordenadas": [],
      }

    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
    identidad_detectada = "Desconocido (Acceso Denegado)"

    if rostros_conocidos_encodings and len(face_encodings) > 0:
      rostro_capturado = face_encodings[0]

      # Comparamos el rostro de la cámara contra TODOS los rostros del almacén
      coincidencias = face_recognition.compare_faces(
          rostros_conocidos_encodings, rostro_capturado, tolerance=0.6
      )
      distancias = face_recognition.face_distance(
          rostros_conocidos_encodings, rostro_capturado
      )

      if True in coincidencias:
        mejor_coincidencia_index = np.argmin(distancias)
        if coincidencias[mejor_coincidencia_index]:
          nombre_encontrado = nombres_conocidos[mejor_coincidencia_index]
          similitud = (1 - distancias[mejor_coincidencia_index]) * 100
          identidad_detectada = (
              f"¡Bienvenido, {nombre_encontrado}! (Similitud: {similitud:.1f}%)"
          )

    resultados = [
        {"top": t, "right": r, "bottom": b, "left": l}
        for t, r, b, l in face_locations
    ]

    return {
        "status": "success",
        "rostros_encontrados": len(face_locations),
        "identidad": identidad_detectada,
        "coordenadas": resultados,
    }

  except Exception as e:
    print(f"Error detallado: {str(e)}")
    raise HTTPException(status_code=500, detail=str(e))