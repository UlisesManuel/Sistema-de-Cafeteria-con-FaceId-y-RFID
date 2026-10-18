# Sistema-de-Cafeteria-con-FaceId-y-RFID
Sistema web de cafetería con autenticación y validación mediante reconocimiento facial. Para la materia de Tecnologías Web II


## Instrucción de Intalación
**FrontEnd**
pnpm install 
pnpm run dev

**BackEnd**
    python -m venv venv
    source venv/bin/activate  # En Linux/Mac

    pip install -r requirements.txt
    pip install git+https://github.com/ageitgey/face_recognition_models

    *Ejecución*
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
